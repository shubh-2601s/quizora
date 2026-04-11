import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import QuizInstructions from './pages/user/QuizInstructions';
import QuizAttempt from './pages/user/QuizAttempt';
import QuizResult from './pages/user/QuizResult';
import UserHistory from './pages/user/UserHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateQuiz from './pages/admin/CreateQuiz';
import AddQuestions from './pages/admin/AddQuestions';
import QuizList from './pages/admin/QuizList';
import QuizDetail from './pages/admin/QuizDetail';
import EditQuiz from './pages/admin/EditQuiz';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              borderRadius: '12px',
              border: '1px solid #E5E1FF',
              boxShadow: '0 4px 16px rgba(108,99,255,0.15)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* User routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/quiz/:code/instructions" element={<ProtectedRoute requiredRole="user"><QuizInstructions /></ProtectedRoute>} />
          <Route path="/quiz/:code/attempt" element={<ProtectedRoute requiredRole="user"><QuizAttempt /></ProtectedRoute>} />
          <Route path="/result/:submissionId" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute requiredRole="user"><UserHistory /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-quiz" element={<ProtectedRoute requiredRole="admin"><CreateQuiz /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute requiredRole="admin"><QuizList /></ProtectedRoute>} />
          <Route path="/admin/quiz/:quizId" element={<ProtectedRoute requiredRole="admin"><QuizDetail /></ProtectedRoute>} />
          <Route path="/admin/quiz/:quizId/edit" element={<ProtectedRoute requiredRole="admin"><EditQuiz /></ProtectedRoute>} />
          <Route path="/admin/quiz/:quizId/questions" element={<ProtectedRoute requiredRole="admin"><AddQuestions /></ProtectedRoute>} />
          <Route path="/admin/manage-users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
