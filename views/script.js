function getFile() {
	const fileHash = document.getElementById('fileHash').value;

	fetch(`/getFile/${fileHash}`)
		.then(res => res.json())
		.then(data => {
			if (data.exist) {
				const fileDetails = document.getElementById('fileDetails');
				fileDetails.innerHTML = `
					<p><strong>File Hash:</strong> ${data.fileHash}</p>
					<p><strong>IPFS Hash:</strong> ${data.ipfsHash}</p>
					<p><strong>File Name:</strong> ${data.fileName}</p>
					<p><strong>File Type:</strong> ${data.fileType}</p>
					<p><strong>Date Added:</strong> ${new Date(data.dateAdded * 1000).toLocaleString()}</p>
				`;
			} else {
				alert('File not found');
			}
		})
		.catch(err => console.error(err));
}
