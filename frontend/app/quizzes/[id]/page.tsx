"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "../../../services/api";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswers: string[];
};

type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};

export default function QuizDetailPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchQuiz(params.id as string);
    }
  }, [params?.id]);

  const fetchQuiz = async (id: string) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      setQuiz(response.data);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Завантаження...</div>;
  if (!quiz) return <div className="p-8 text-center text-red-500">Квіз не знайдено</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/quizzes" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Повернутися до списку
      </Link>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
        <p className="text-gray-500 mt-2">Кількість питань: {quiz.questions.length}</p>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {index + 1}. {question.text}
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Тип питання: {question.type}
              </p>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Правильна відповідь:</p>
                  <p className="text-gray-800">{question.correctAnswers.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}