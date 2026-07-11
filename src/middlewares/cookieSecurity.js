const cookieSecurity = (req, res, next) => {
  res.cookie('session', 'active', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  next();
};

export default cookieSecurity;
