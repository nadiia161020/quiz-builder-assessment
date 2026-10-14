"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus } from "lucide-react";
import { api } from "../../services/api";

const questionSchema = z.object({
  text: z.string().min(1, "Текст питання обов'язковий"),
  type: z.enum(["BOOLEAN", "INPUT", "CHECKBOX"]),
  options: z.array(z.string()).default([]),
  correctAnswers: z.array(z.string()).min(1, "Потрібна хоча б одна правильна відповідь"),
});

const quizSchema = z.object({
  title: z.string().min(3, "Назва має містити мінімум 3 символи"),
  questions: z.array(questionSchema).min(1, "Додайте хоча б одне питання"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function CreateQuizPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      questions: [], // Очистили масив, щоб не генерувати ID на сервері
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "questions",
    control,
  });

  // Додаємо перше порожнє питання безпечно, тільки на стороні клієнта
  useEffect(() => {
    if (fields.length === 0) {
      append({ text: "", type: "INPUT", options: [], correctAnswers: [""] });
    }
  }, [append, fields.length]);

  const onSubmit = async (data: QuizFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/quizzes", data);
      router.push("/quizzes"); // Після успішного створення перекидаємо на дашборд
    } catch (error) {
      console.error("Помилка при створенні квізу:", error);
      alert("Не вдалося зберегти квіз. Перевірте консоль.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Створення нового квізу</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Поле назви квізу */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Назва квізу</label>
          <input
            {...register("title")}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Наприклад: Основи JavaScript"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Динамічний список питань */}
        <div className="space-y-6">
          {fields.map((field, index) => {
            const questionType = watch(`questions.${index}.type`);

            return (
              <div key={field.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Питання {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Текст питання</label>
                    <input
                      {...register(`questions.${index}.text`)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-black placeholder-gray-400 bg-white outline-none focus:border-blue-500"
                      placeholder="Введіть питання..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                    <select
                      {...register(`questions.${index}.type`)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-black bg-white outline-none focus:border-blue-500"
                    >
                      <option value="INPUT" className="text-black">Коротка відповідь</option>
                      <option value="BOOLEAN" className="text-black">Так / Ні</option>
                      <option value="CHECKBOX" className="text-black">Множинний вибір</option>
                    </select>
                  </div>
                </div>

                {/* Поля для правильної відповіді залежно від типу */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Правильна відповідь</label>
                  
                  {questionType === "INPUT" && (
                    <input
                      {...register(`questions.${index}.correctAnswers.0`)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-black placeholder-gray-400 bg-white outline-none"
                      placeholder="Точна правильна відповідь..."
                    />
                  )}

                  {questionType === "BOOLEAN" && (
                    <select
                      {...register(`questions.${index}.correctAnswers.0`)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-black bg-white outline-none"
                    >
                      <option value="true" className="text-black">True (Так)</option>
                      <option value="false" className="text-black">False (Ні)</option>
                    </select>
                  )}

                  {questionType === "CHECKBOX" && (
                    <div className="text-sm text-gray-500">
                      Для економії часу в базовій версії ми записуємо варіанти через кому:
                      <input
                        {...register(`questions.${index}.correctAnswers.0`)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-black placeholder-gray-400 bg-white outline-none mt-2"
                        placeholder="Варіант 1, Варіант 2..."
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Кнопки управління */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => append({ text: "", type: "INPUT", options: [], correctAnswers: [""] })}
            className="flex-1 border-2 border-dashed border-blue-300 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Додати ще одне питання
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Збереження..." : "Зберегти квіз"}
          </button>
        </div>
      </form>
    </div>
  );
}