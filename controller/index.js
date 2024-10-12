const index = async (req, res) => {
  console.log('/', req.session)
  res.json({ message: 'Login successful' });
  // res.set({ "Content-Type": "text/html; charset=utf-8" });
  // res.send("<h1>Welcome Express!</h1>");
}

export { index }