"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function EditQuizPage() {
  const router = useRouter();
  const { user } = useUser();
  const params = useParams();
  const quizId = (params?.id as Id<"quizzes">) || "";
  
  const quiz = useQuery(api.web.quizzes.getAllQuizzes);
  const updateQuiz = useMutation(api.web.quizzes.updateQuiz);
  const createNotification = useMutation(api.web.notifications.createNotification);
  const notifyQuizActivity = useAction(api.pushNotifications.notifyQuizActivity);

  const currentQuiz = quiz?.find((q) => q._id === quizId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // When the quizzes query resolves, mark loaded. If we found the quiz, populate fields.
    if (!isLoaded && quiz !== undefined) {
      if (currentQuiz) {
        setTitle(currentQuiz.title);
        setDescription(currentQuiz.description);
        setCategory(currentQuiz.category);
        setDifficulty(currentQuiz.difficulty);
        setDuration(currentQuiz.duration);
        setQuestions(currentQuiz.questions);
      }
      setIsLoaded(true);
    }
  }, [quiz, currentQuiz, isLoaded]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: String(questions.length + 1),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizId) {
      alert("Quiz ID is missing");
      return;
    }

    if (!title || !description || questions.some((q) => !q.question || q.options.some((o) => !o))) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateQuiz({
        _id: quizId as Id<"quizzes">,
        title,
        description,
        category,
        difficulty,
        duration,
        questions,
      });

      if (user) {
        await createNotification({
          userId: user.id,
          title: "Quiz Updated",
          message: `"${title}" has been updated successfully`,
          type: "quiz_updated",
          quizId: currentQuiz?.id,
        });
        if (notifyQuizActivity) {
          try {
            await notifyQuizActivity({
              quizId: currentQuiz?.id || "",
              title: "Quiz updated",
              body: `"${title}" was just updated on the admin dashboard.`,
            });
          } catch (error) {
            console.error("Failed to send quiz update notification:", error);
          }
        }
      }

      router.push("/dashboard/quizzes");
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Failed to update quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Quiz not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Quiz</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update quiz details and questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  min="1"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <Button type="button" onClick={addQuestion} size="sm" className="gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Question Text *
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options * (Select correct answer)
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, "correctAnswer", oIndex)}
                          className="mt-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Explanation
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
