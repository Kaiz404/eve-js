function getUserInfo(message) {
  console.log("Getting user info...");
  console.log(message.author);
  const authorJson = JSON.stringify(message.author);
  console.log(authorJson);
  return authorJson;
}

module.exports = getUserInfo;