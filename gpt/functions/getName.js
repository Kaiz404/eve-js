function getName(message) {
	if (message.author.globalName) {
		return message.author.globalName;
	}
	return message.author.username;
}

module.exports = getName;