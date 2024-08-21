
        const fileInput = document.getElementById('fileInput');
        const processButton = document.getElementById('processButton');
        const output = document.getElementById('output');
        const message = document.getElementById('message');
        const copyButton = document.getElementById('copyButton');
        const languageSelect = document.getElementById('languageSelect');
        let selectedFile;

        fileInput.addEventListener('change', (event) => {
            selectedFile = event.target.files[0];
        });

        processButton.addEventListener('click', async () => {
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const img = new Image();
                    img.src = e.target.result;
                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL('image/png');
                        const text = await extractTextFromImage(dataUrl);
                        if (text) {
                            displayTextCharacterByCharacter(text);
                            output.classList.remove('hidden');
                            copyButton.classList.remove('hidden');
                            message.classList.add('hidden');
                        } else {
                            message.textContent = 'Fotoğraf üzerinde yazı bulunamadı.';
                            message.classList.remove('hidden');
                            output.classList.add('hidden');
                            copyButton.classList.add('hidden');
                        }
                    };
                };
                reader.readAsDataURL(selectedFile);
            } else {
                message.textContent = 'Üstündeki yazıyı metin olarak almak için önce bir fotoğraf yüklemelisiniz.';
                message.classList.remove('hidden');
                output.classList.add('hidden');
                copyButton.classList.add('hidden');
            }
        });

        function displayTextCharacterByCharacter(text) {
            output.textContent = '';
            let index = 0;
            const interval = setInterval(() => {
                if (index < text.length) {
                    output.textContent += text[index];
                    index++;
                    output.scrollTop = output.scrollHeight;
                } else {
                    clearInterval(interval);
                    copyButton.classList.remove('hidden');
                }
            }, 30);
        }

        copyButton.addEventListener('click', () => {
            const text = output.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showAlert('Yazı kopyalandı!');
                copyButton.remove();
            }).catch(err => {
                console.error('Yazı kopyalanamadı: ', err);
            });
        });

        async function extractTextFromImage(dataUrl) {
            const { createWorker } = Tesseract;
            const worker = createWorker();
            const selectedLanguage = languageSelect.value;
            await worker.load();
            await worker.loadLanguage(selectedLanguage);
            await worker.initialize(selectedLanguage);
            const { data: { text } } = await worker.recognize(dataUrl);
            await worker.terminate();
            return text;
        }

        function showAlert(message) {
            const alertBox = document.createElement('div');
            alertBox.className = 'custom-alert';
            alertBox.textContent = message;
            document.body.appendChild(alertBox);
            setTimeout(() => {
                alertBox.remove();
            }, 3000);
        }
