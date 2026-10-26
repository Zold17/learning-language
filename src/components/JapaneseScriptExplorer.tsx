import React, { useState } from 'react';
import { HIRAGANA_DATA, KANJI_DATA, KANJI_QUIZZES } from '../data/japaneseScriptData';
import { HiraganaChar, KanjiItem, KanjiQuizQuestion } from '../types/kanji';
import { playAudioSentence, playSoundEffect } from '../services/speechService';
import { useProgress } from '../context/ProgressContext';
import {
  Volume2,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Layers,
  ChevronRight
} from 'lucide-react';

export const JapaneseScriptExplorer: React.FC = () => {
  const { addPoints } = useProgress();
  const [activeTab, setActiveTab] = useState<'hiragana' | 'kanji' | 'quiz'>('kanji');

  // Hiragana state
  const [selectedHiragana, setSelectedHiragana] = useState<HiraganaChar | null>(null);

  // Kanji state
  const [selectedKanjiCategory, setSelectedKanjiCategory] = useState<string>('all');
  const [kanjiSearch, setKanjiSearch] = useState<string>('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState<boolean>(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Filter Kanji
  const filteredKanji = KANJI_DATA.filter((k) => {
    const matchesCat = selectedKanjiCategory === 'all' || k.category === selectedKanjiCategory;
    const q = kanjiSearch.toLowerCase();
    const matchesSearch =
      !q ||
      k.kanji.includes(q) ||
      k.meaning.toLowerCase().includes(q) ||
      k.romaji.toLowerCase().includes(q) ||
      k.onyomi.some((on) => on.toLowerCase().includes(q)) ||
      k.kunyomi.some((kun) => kun.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handlePlayAudio = (text: string) => {
    playAudioSentence(text, 'ja-JP', 0.85);
  };

  const handleSelectQuizOption = (opt: string) => {
    if (quizIsAnswered) return;
    setQuizSelectedOption(opt);
    setQuizIsAnswered(true);

    const currentQ = KANJI_QUIZZES[quizIndex];
    const isRight = opt === currentQ.correctAnswer;
    setQuizIsCorrect(isRight);

    if (isRight) {
      playSoundEffect('success');
      setQuizScore((prev) => prev + 1);
      addPoints(20);
    } else {
      playSoundEffect('click');
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < KANJI_QUIZZES.length) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizIsAnswered(false);
      setQuizIsCorrect(false);
    } else {
      setQuizFinished(true);
      playSoundEffect('streak');
      addPoints(35);
    }
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setQuizIsCorrect(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Aksara Jepang</span>
            <span aria-hidden="true">·</span>
            <span>Hiragana & Kanji Dasar</span>
            <span aria-hidden="true">·</span>
            <span>Suara & Kuis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Modul Aksara: Hiragana & Kanji Sehari-hari
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Pahami cara baca, arti, dan komponen pembentuk huruf Jepang kata demi kata untuk memperkuat pemahaman percakapan Anda.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('kanji')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'kanji'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Koleksi Kanji Harian
          </button>
          <button
            onClick={() => setActiveTab('hiragana')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'hiragana'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel 46 Hiragana
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kuis Tebak Bacaan
          </button>
        </div>
      </div>

      {/* VIEW 1: KANJI COLLECTION */}
      {activeTab === 'kanji' && (
        <div>
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kanjiSearch}
                onChange={(e) => setKanjiSearch(e.target.value)}
                placeholder="Cari Kanji, arti, Romaji (contoh: stasiun, eki, makan, taberu)..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl pl-9 pr-3 py-2.5 outline-none border border-slate-200 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'angka_waktu', label: 'Angka & Waktu' },
                { id: 'makanan', label: 'Makanan & Kafe' },
                { id: 'tempat_arah', label: 'Tempat & Transport' },
                { id: 'kehidupan', label: 'Kehidupan & Orang' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedKanjiCategory(cat.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    selectedKanjiCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kanji Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKanji.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedKanji(item)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {item.jlptLevel} · {item.strokeCount} Goresan
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(item.kanji);
                      }}
                      title="Dengarkan pengucapan"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Character Hero */}
                  <div className="text-center py-2">
                    <span className="text-4xl sm:text-5xl font-black font-jp text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.kanji}
                    </span>
                    <div className="text-xs text-indigo-600 font-semibold mt-1">
                      {item.romaji}
                    </div>
                  </div>

                  {/* Meaning */}
                  <div className="text-center text-sm font-bold text-slate-800 mb-3">
                    {item.meaning}
                  </div>

                  {/* Onyomi & Kunyomi Preview */}
                  <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] space-y-1 border border-slate-100">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-400 mr-1.5">Kunyomi:</span>
                      {item.kunyomi.length > 0 ? item.kunyomi.join(', ') : '-'}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-400 mr-1.5">Onyomi:</span>
                      {item.onyomi.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Example word preview */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Contoh: {item.examples[0]?.word} ({item.examples[0]?.furigana})</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: HIRAGANA GOJUON CHART */}
      {activeTab === 'hiragana' && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tabel 46 Huruf Hiragana (五十音 - Gojūon)</h3>
                <p className="text-xs text-slate-500">Ketuk huruf mana saja untuk mendengarkan lafal dan melihat contoh kosa katanya.</p>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                46 Karakter Dasar
              </span>
            </div>

            {/* Grid of Hiragana Characters */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {HIRAGANA_DATA.map((h, hidx) => {
                const isSelected = selectedHiragana?.character === h.character;
                return (
                  <button
                    key={hidx}
                    onClick={() => {
                      setSelectedHiragana(h);
                      handlePlayAudio(h.character);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm scale-105'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl font-black font-jp text-slate-900">
                      {h.character}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {h.romaji}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Hiragana Detail Card */}
          {selectedHiragana && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in duration-150">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center shadow-sm">
                  <span className="text-5xl font-black font-jp text-indigo-900">
                    {selectedHiragana.character}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Karakter Terpilih:
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    Romaji: /{selectedHiragana.romaji}/
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Contoh kosa kata: <strong className="text-slate-900">{selectedHiragana.exampleWord}</strong> ({selectedHiragana.exampleRomaji}) - {selectedHiragana.exampleMeaning}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayAudio(selectedHiragana.character)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengar Lafal Huruf</span>
                </button>
                <button
                  onClick={() => handlePlayAudio(selectedHiragana.exampleWord)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Dengar Contoh Kata</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: KANJI & HIRAGANA READING QUIZ */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto">
          {!quizFinished ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4 pb-3 border-b border-slate-100">
                <span>Soal {quizIndex + 1} dari {KANJI_QUIZZES.length}</span>
                <span className="text-indigo-600 font-bold">Kuis Tebak Bacaan & Makna</span>
              </div>

              {/* Target Character Callout */}
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6 relative">
                <span className="text-6xl font-black font-jp text-slate-900">
                  {KANJI_QUIZZES[quizIndex].targetCharacter}
                </span>
                <button
                  onClick={() => handlePlayAudio(KANJI_QUIZZES[quizIndex].targetCharacter)}
                  title="Dengarkan pengucapan"
                  className="absolute right-4 top-4 p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prompt */}
              <div className="text-base sm:text-lg font-bold text-slate-900 mb-5 text-center">
                {KANJI_QUIZZES[quizIndex].prompt}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {KANJI_QUIZZES[quizIndex].options.map((opt, oidx) => {
                  const isSelected = quizSelectedOption === opt;
                  const isRight = opt === KANJI_QUIZZES[quizIndex].correctAnswer;

                  let style = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';
                  if (quizIsAnswered) {
                    if (isRight) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      style = 'border-rose-400 bg-rose-50 text-rose-950';
                    } else {
                      style = 'border-slate-100 opacity-50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={oidx}
                      disabled={quizIsAnswered}
                      onClick={() => handleSelectQuizOption(opt)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {quizIsAnswered && isRight && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                      {quizIsAnswered && isSelected && !isRight && <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {quizIsAnswered && (
                <div className={`p-4 rounded-2xl border mb-6 text-xs leading-relaxed ${
                  quizIsCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <span className="font-bold block mb-1">
                    {quizIsCorrect ? '✓ Jawaban Anda Benar! (+20 XP)' : 'Penjelasan Kosa Kata:'}
                  </span>
                  {KANJI_QUIZZES[quizIndex].explanation}
                </div>
              )}

              {/* Next Button */}
              {quizIsAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuiz}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <span>{quizIndex + 1 < KANJI_QUIZZES.length ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Kuis'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-md">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Kuis Aksara Selesai!</h3>
              <p className="text-xs text-slate-600 mb-6">
                Skor Anda: <strong className="text-indigo-600 text-base font-bold">{quizScore} / {KANJI_QUIZZES.length}</strong> benar. Pengetahuan aksara Jepang Anda semakin tajam!
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  onClick={() => setActiveTab('kanji')}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <span>Kembali ke Koleksi Kanji</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Kanji Deep Dive Modal */}
      {selectedKanji && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  JLPT {selectedKanji.jlptLevel} · {selectedKanji.strokeCount} Goresan
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">Detail Karakter Kanji</h4>
              </div>
              <button
                onClick={() => setSelectedKanji(null)}
                className="text-xs px-3 py-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Kanji Big Visual */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center mb-4 relative">
              <span className="text-6xl sm:text-7xl font-black font-jp text-slate-900">
                {selectedKanji.kanji}
              </span>
              <div className="text-sm font-bold text-indigo-600 mt-1">
                Romaji: {selectedKanji.romaji}
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                Arti: "{selectedKanji.meaning}"
              </div>

              <button
                onClick={() => handlePlayAudio(selectedKanji.kanji)}
                title="Dengarkan pengucapan"
                className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Readings Table */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
                <span className="text-indigo-950 font-bold block mb-1">Cara Baca Kunyomi (Jepang):</span>
                <span className="text-slate-700 font-medium">{selectedKanji.kunyomi.length > 0 ? selectedKanji.kunyomi.join(', ') : 'Tidak ada'}</span>
              </div>
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3">
                <span className="text-rose-950 font-bold block mb-1">Cara Baca Onyomi (Sino-Jepang):</span>
                <span className="text-slate-700 font-medium">{selectedKanji.onyomi.join(', ')}</span>
              </div>
            </div>

            {/* Examples in real life conversation */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Contoh Penggunaan dalam Kosa Kata:
              </span>
              <div className="space-y-2">
                {selectedKanji.examples.map((ex, eidx) => (
                  <div
                    key={eidx}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-jp">
                        {ex.word} <span className="text-xs font-medium text-indigo-600">({ex.furigana} / {ex.romaji})</span>
                      </div>
                      <div className="text-xs text-slate-600">{ex.meaning}</div>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(ex.word)}
                      title="Dengarkan kata ini"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedKanji(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Kembali ke Daftar Kanji
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
