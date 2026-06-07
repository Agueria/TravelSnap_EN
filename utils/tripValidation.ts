interface TripFormFields {
  title: string;
  destination: string;
  date: string;
  rating: string;
}

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const validateTripForm = ({
  title,
  destination,
  date,
  rating,
}: TripFormFields): string | null => {
  if (!title.trim() || !destination.trim() || !date.trim() || !rating.trim()) {
    return 'All fields are required!';
  }

  if (!DATE_REGEX.test(date.trim())) {
    return 'Date must be in YYYY-MM-DD format!';
  }

  const ratingNum = Number(rating);
  if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return 'Rating must be a number between 1 and 5!';
  }

  return null;
};
