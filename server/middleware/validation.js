function validateTransaction(req, res, next) {
  const { date, description, category, amount, paymentMethod } = req.body;
  const errors = [];

  if (!date || typeof date !== 'string' || !date.trim()) {
    errors.push('Valid date is required.');
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required.');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required.');
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.push('Amount must be a number greater than 0.');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
    errors.push('Payment Method is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
}

function validateEarning(req, res, next) {
  const { date, description, source, amount } = req.body;
  const errors = [];

  if (!date || typeof date !== 'string' || !date.trim()) {
    errors.push('Valid date is required.');
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required.');
  }

  if (!source || typeof source !== 'string' || !source.trim()) {
    errors.push('Source is required.');
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    errors.push('Amount must be a number greater than 0.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
}

module.exports = {
  validateTransaction,
  validateEarning
};
