import { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, useHasUserFeedback } from '../hooks/useFirestore';
import { useThrottle } from '../hooks/useThrottle';
import { useToast } from './ui/Toast';
import { sanitizeInput } from '../lib/sanitize';
import { validateRating, validateComment } from '../lib/validators';
import StarRating from './ui/StarRating';
import Button from './ui/Button';

export default function FeedbackForm({ menuId, onSubmitted }) {
  const { currentUser, userData } = useAuth();
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { hasFeedback, loading: checkingFeedback } = useHasUserFeedback(menuId, currentUser?.uid);
  const alreadySubmitted = submitted || hasFeedback;

  const doSubmit = async () => {
    // Validate
    const ratingResult = validateRating(rating);
    const commentResult = validateComment(komentar);
    if (!ratingResult.valid || !commentResult.valid) {
      setErrors({
        rating: ratingResult.valid ? '' : ratingResult.message,
        komentar: commentResult.valid ? '' : commentResult.message,
      });
      return;
    }

    // Duplicate is now prevented by the realtime hasFeedback check above
    if (alreadySubmitted) {
      addToast('Anda sudah memberikan feedback untuk menu ini', 'info');
      return;
    }

    // Sanitize and submit
    const cleanComment = sanitizeInput(komentar);
    await submitFeedback(
      menuId,
      currentUser.uid,
      userData.nip,
      userData.instansi,
      rating,
      cleanComment
    );

    setRating(0);
    setKomentar('');
    setErrors({});
    setSubmitted(true);
    addToast('Feedback berhasil dikirim!', 'success');
    onSubmitted?.();
  };

  const { throttledFn: handleSubmit, isThrottled } = useThrottle(doSubmit, 3000);

  if (alreadySubmitted) {
    return (
      <div className="text-center py-6 glass rounded-2xl">
        <p className="flex items-center justify-center gap-2 text-success font-semibold">
          <CheckCircle2 className="w-5 h-5" /> Feedback Anda sudah terkirim
        </p>
        <p className="text-xs text-text-muted mt-1">Terima kasih atas penilaian Anda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-text-secondary mb-2">Rating</p>
        <StarRating value={rating} onChange={setRating} size={28} />
        {errors.rating && <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertTriangle className="w-3 h-3" /> {errors.rating}</p>}
      </div>

      <div>
        <label htmlFor="feedback-comment" className="block text-sm font-medium text-text-secondary mb-2">
          Komentar
        </label>
        <textarea
          id="feedback-comment"
          value={komentar}
          onChange={(e) => {
            if (e.target.value.length <= 500) setKomentar(e.target.value);
          }}
          placeholder="Tulis komentar tentang menu hari ini..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-black/5 border border-black/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.komentar && <p className="flex items-center gap-1 text-xs text-danger"><AlertTriangle className="w-3 h-3" /> {errors.komentar}</p>}
          <p className="text-[10px] text-text-muted ml-auto">{komentar.length}/500</p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        loading={isThrottled}
        disabled={rating === 0}
        icon={Send}
        className="w-full"
      >
        Kirim Feedback
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-success" /> Identitas Anda disamarkan — hanya NIP sebagian dan instansi yang ditampilkan
      </p>
    </div>
  );
}

