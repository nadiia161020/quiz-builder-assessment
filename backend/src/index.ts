import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Ініціалізуємо Prisma та Express
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json()); 


app.post('/quizzes', async (req, res) => {
  try {
    const { title, questions } = req.body;
    
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        questions: {
          create: questions, 
        },
      },
      include: {
        questions: true, 
      },
    });
    
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

app.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' } 
    });
    
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      questionsCount: quiz._count.questions,
      createdAt: quiz.createdAt
    }));

    res.json(formattedQuizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.get('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }, 
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz details' });
  }
});

app.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.quiz.delete({
      where: { id },
    });
    
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});