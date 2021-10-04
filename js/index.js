async function submitHandler() {
	const textInput = document.getElementById("inputText");

	if (textInput.value === "") return;

	const loader = document.getElementById("loader");
	const submitBtn = document.getElementById("inputSubmit");

	submitBtn.style.display = "none";
	loader.style.display = "inline-block";

	// eslint-disable-next-line no-undef
	const parsedText = await parseText(textInput.value);

	submitBtn.style.display = "inline-block";
	loader.style.display = "none";

	document.getElementById("outputContainer").style.display = "block";
	document.getElementById("output").textContent = parsedText;
}

function init() {
	document.getElementById("inputSubmit").addEventListener("click", submitHandler);
}

(() => {
	document.addEventListener("DOMContentLoaded", init);
})();
