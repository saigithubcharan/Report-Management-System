const setAccountDetails = ({ token, userId, name }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("name", name);

};

const getAccountDetails = () => {
  const accessToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("name");
  return { accessToken, userId, name };
};

const clearAccountDetails = () => {
  localStorage.clear();
};

export { setAccountDetails, getAccountDetails, clearAccountDetails };
