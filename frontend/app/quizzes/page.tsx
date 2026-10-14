"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { api } from "@/services/api";

type Quiz = {
  id: string;
  title: string;
  questionsCount: number;
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Викликаємо API при завантаженні сторінки
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/quizzes");
      setQuizzes(response.data);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Функція для видалення квізу
  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей квіз?")) return;
    
    try {
      await api.delete(`/quizzes/${id}`);
      // Оновлюємо стан на фронтенді, щоб квіз миттєво зник
      setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Завантаження...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Дашборд квізів</h1>
        <Link
          href="/create"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Створити квіз
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Квізів ще немає. Створіть свій перший квіз!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-gray-200 p-5 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition">
                  {quiz.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Кількість питань: {quiz.questionsCount}
                </p>
              </Link>
              
              <button
                onClick={() => handleDelete(quiz.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                title="Видалити квіз"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}