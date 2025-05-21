document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const grayValueInput = document.getElementById('gray-value');
    const colorCountInput = document.getElementById('color-count');
    const generateBtn = document.getElementById('generate-btn');
    const presetLightBtn = document.getElementById('preset-light');
    const presetMidBtn = document.getElementById('preset-mid');
    const presetDarkBtn = document.getElementById('preset-dark');
    const grayPreview = document.getElementById('gray-preview');
    const grayInfo = document.getElementById('gray-info');
    const colorGrid = document.getElementById('color-grid');

    // 背景色関連の要素
    const backgroundColorInput = document.getElementById('background-color');
    const backgroundHexDisplay = document.getElementById('background-hex');
    const applyBackgroundBtn = document.getElementById('apply-background-btn');

    
    // テキスト表示用の要素
    const displayTextInput = document.getElementById('display-text');
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const updateTextBtn = document.getElementById('update-text-btn');
    const textPreview = document.getElementById('text-preview');
    const textPreviewContainer = document.getElementById('text-preview-container');

    // 図形表示用の要素
    const shapeTypeSelect = document.getElementById('shape-type');
    const shapeCountInput = document.getElementById('shape-count');
    const shapeCountValue = document.getElementById('shape-count-value');
    const shapeSizeInput = document.getElementById('shape-size');
    const shapeSizeValue = document.getElementById('shape-size-value');
    const generateShapesBtn = document.getElementById('generate-shapes-btn');
    const randomShapesBtn = document.getElementById('random-shapes-btn');
    const shapePreview = document.getElementById('shape-preview');
    const shapePreviewContainer = document.getElementById('shape-preview-container');

    // 通知表示用の要素
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);

    // カラーパターンを管理する変数
    let textColors = [];
    let colorPattern = 'sequential'; // sequential, random, gradient
    
    // 現在のグレースケール値
    let currentGrayValue = 128;

    // プリセットボタンのイベントリスナー
    presetLightBtn.addEventListener('click', () => {
        grayValueInput.value = 192;
        generateColors();
    });

    presetMidBtn.addEventListener('click', () => {
        grayValueInput.value = 128;
        generateColors();
    });

    presetDarkBtn.addEventListener('click', () => {
        grayValueInput.value = 64;
        generateColors();
    });

    // 生成ボタンのイベントリスナー
    generateBtn.addEventListener('click', generateColors);

    // 背景色の選択に関するイベントリスナー
    backgroundColorInput.addEventListener('input', () => {
        updateBackgroundHexDisplay();
        
        // 背景色のグレー値を計算し自動更新
        const color = backgroundColorInput.value;
        const rgbColor = hexToRgb(color);
        if (rgbColor) {
            const grayValue = calculateGrayValue(rgbColor.r, rgbColor.g, rgbColor.b);
            grayValueInput.value = Math.round(grayValue);
            // 更新された値でカラーを生成
            generateColors(true);
        }
    });
    applyBackgroundBtn.addEventListener('click', applyBackgroundColor);

    // フォントサイズ変更のイベントリスナー
    fontSizeInput.addEventListener('input', () => {
        const size = fontSizeInput.value;
        fontSizeValue.textContent = `${size}px`;
        updateColorfulText();
    });

    // テキスト更新ボタンのイベントリスナー
    updateTextBtn.addEventListener('click', () => {
        // 色のパターンをランダムに変更
        const patterns = ['sequential', 'random', 'gradient'];
        colorPattern = patterns[Math.floor(Math.random() * patterns.length)];
        updateColorfulText();
    });
    
    // 図形関連のイベントリスナー
    shapeCountInput.addEventListener('input', () => {
        const count = shapeCountInput.value;
        shapeCountValue.textContent = `${count}個`;
    });
    
    shapeSizeInput.addEventListener('input', () => {
        const size = shapeSizeInput.value;
        shapeSizeValue.textContent = `${size}px`;
    });
    
    generateShapesBtn.addEventListener('click', () => {
        generateShapes(shapeTypeSelect.value);
    });
    
    randomShapesBtn.addEventListener('click', () => {
        // ランダムな設定で図形を生成
        shapeTypeSelect.value = ['circles', 'squares', 'triangles', 'random', 'pattern'][Math.floor(Math.random() * 5)];
        shapeCountInput.value = Math.floor(Math.random() * 50) + 10;
        shapeSizeInput.value = Math.floor(Math.random() * 60) + 20;
        shapeCountValue.textContent = `${shapeCountInput.value}個`;
        shapeSizeValue.textContent = `${shapeSizeInput.value}px`;
        
        generateShapes(shapeTypeSelect.value);
    });

    // 初期表示
    generateColors();
    updateBackgroundHexDisplay();

    // 通知を表示する関数
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 閉じるボタン
        const closeBtn = document.createElement('span');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        notification.appendChild(closeBtn);
        notificationContainer.appendChild(notification);
        
        // 一定時間後に自動で消える
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
        
        return notification;
    }
    
    // 確認ダイアログを表示する関数
    function showConfirmation(message, callback) {
        const confirmBox = document.createElement('div');
        confirmBox.className = 'confirmation-box';
        
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'confirmation-buttons';
        
        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'はい';
        yesBtn.addEventListener('click', () => {
            confirmBox.remove();
            callback(true);
        });
        
        const noBtn = document.createElement('button');
        noBtn.textContent = 'いいえ';
        noBtn.addEventListener('click', () => {
            confirmBox.remove();
            callback(false);
        });
        
        buttonContainer.appendChild(yesBtn);
        buttonContainer.appendChild(noBtn);
        
        confirmBox.appendChild(messageEl);
        confirmBox.appendChild(buttonContainer);
        
        // 画面に表示
        document.body.appendChild(confirmBox);
        
        // ESCキーでキャンセル
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                confirmBox.remove();
                callback(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 初期のカラーピッカー値をグレー値から設定
    function initColorPicker() {
        const grayValue = parseInt(grayValueInput.value);
        const hexValue = rgbToHex(grayValue, grayValue, grayValue);
        backgroundColorInput.value = hexValue;
        backgroundHexDisplay.textContent = hexValue;
    }

    // 背景色のHex表示を更新
    function updateBackgroundHexDisplay() {
        backgroundHexDisplay.textContent = backgroundColorInput.value;
    }

    // 選択した背景色をテキストプレビューに適用
    function applyBackgroundColor() {
        const color = backgroundColorInput.value;
        textPreviewContainer.style.backgroundColor = color;
        shapePreviewContainer.style.backgroundColor = color;
        
        showNotification('プレビュー背景色を更新しました', 'success');
    }

    // 16進数カラーコードをRGBに変換
    function hexToRgb(hex) {
        // #を削除
        hex = hex.replace(/^#/, '');
        
        // RGBに変換
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return { r, g, b };
    }

    // RGB値からグレースケール値を計算
    function calculateGrayValue(r, g, b) {
        return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    // グレースケール値からカラーを生成する関数
    function generateColors(skipNotification = false) {
        // 入力値の取得と検証
        let grayValue = parseInt(grayValueInput.value);
        if (isNaN(grayValue) || grayValue < 0) grayValue = 0;
        if (grayValue > 255) grayValue = 255;
        grayValueInput.value = grayValue;
        currentGrayValue = grayValue;

        let colorCount = parseInt(colorCountInput.value);
        if (isNaN(colorCount) || colorCount < 1) colorCount = 1;
        if (colorCount > 100) colorCount = 100;
        colorCountInput.value = colorCount;

        // テキスト用に色の数を増やす（最大50色）
        const textColorCount = Math.min(Math.max(50, colorCount), 100);

        // グレースケールプレビューの更新
        const grayColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        grayPreview.style.backgroundColor = grayColor;
        grayInfo.innerHTML = `RGB: ${grayValue}, ${grayValue}, ${grayValue}<br>HEX: ${rgbToHex(grayValue, grayValue, grayValue)}`;

        // 同じグレースケール値を持つ色を生成
        const colors = generateEquivalentColors(grayValue, colorCount);
        displayColors(colors);
        
        // テキスト表示用にたくさんの色を生成
        const textColorsList = generateEquivalentColors(grayValue, textColorCount);
        
        // 背景色更新のリンクを表示
        const updateBgLink = document.createElement('a');
        updateBgLink.href = '#';
        updateBgLink.className = 'action-link';
        updateBgLink.textContent = 'プレビュー背景色を更新';
        updateBgLink.addEventListener('click', (e) => {
            e.preventDefault();
            textPreviewContainer.style.backgroundColor = grayColor;
            shapePreviewContainer.style.backgroundColor = grayColor;
            backgroundColorInput.value = rgbToHex(grayValue, grayValue, grayValue);
            updateBackgroundHexDisplay();
            showNotification('背景色をグレースケール値に合わせて更新しました', 'success');
        });
        
        // 前のリンクがあれば削除
        const oldLink = document.querySelector('.update-bg-link');
        if (oldLink) {
            oldLink.remove();
        }
        
        // リンクを追加
        updateBgLink.classList.add('update-bg-link');
        const infoContainer = document.querySelector('.grayscale-preview');
        infoContainer.appendChild(updateBgLink);
        
        // カラフルテキストを更新
        updateColorfulText(textColorsList);
        
        // 現在の図形を再生成
        if (shapePreview.children.length > 0) {
            generateShapes(shapeTypeSelect.value);
        }
        
        // 自動更新時は通知しない
        if (!skipNotification) {
            showNotification(`グレー値 ${grayValue} の同等色を生成しました`, 'success');
        }
    }

    // 指定したグレースケール値と同等のRGB色を生成する関数
    function generateEquivalentColors(grayValue, count) {
        const colors = [];
        const step = Math.floor(255 / Math.sqrt(count));
        
        // グレースケール変換の重み
        const rWeight = 0.299;
        const gWeight = 0.587;
        const bWeight = 0.114;

        // 異なるバリエーションの色を生成
        for (let r = 0; r <= 255; r += step) {
            for (let b = 0; b <= 255; b += step) {
                // グレー値が等しくなるようにG値を計算
                // Gray = 0.299*R + 0.587*G + 0.114*B を変形して G について解く
                let g = (grayValue - r * rWeight - b * bWeight) / gWeight;
                g = Math.round(g);
                
                if (g >= 0 && g <= 255) {
                    const actualGray = Math.round(r * rWeight + g * gWeight + b * bWeight);
                    // 計算誤差を確認（1以内なら許容）
                    if (Math.abs(actualGray - grayValue) <= 1) {
                        colors.push({r, g, b, actualGray});
                    }
                }
                
                if (colors.length >= count) break;
            }
            if (colors.length >= count) break;
        }

        // 色のバリエーションが少ない場合は、別のアプローチで補完
        if (colors.length < count) {
            for (let r = 0; r <= 255 && colors.length < count; r += step) {
                for (let g = 0; g <= 255 && colors.length < count; g += step) {
                    let b = (grayValue - r * rWeight - g * gWeight) / bWeight;
                    b = Math.round(b);
                    
                    if (b >= 0 && b <= 255) {
                        const actualGray = Math.round(r * rWeight + g * gWeight + b * bWeight);
                        if (Math.abs(actualGray - grayValue) <= 1) {
                            // 既に同じ色がないか確認
                            const exists = colors.some(color => 
                                color.r === r && color.g === g && color.b === b);
                            
                            if (!exists) {
                                colors.push({r, g, b, actualGray});
                            }
                        }
                    }
                }
            }
        }

        // 色を適切な数に調整
        return colors.slice(0, count);
    }

    // 色を表示する関数
    function displayColors(colors) {
        colorGrid.innerHTML = '';
        
        colors.forEach(color => {
            const {r, g, b, actualGray} = color;
            const rgbString = `rgb(${r}, ${g}, ${b})`;
            const hexString = rgbToHex(r, g, b);
            
            // テキスト色（背景色によって黒または白）
            const textColor = r*0.299 + g*0.587 + b*0.114 > 128 ? 'black' : 'white';
            
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.innerHTML = `
                <div class="color-sample" style="background-color: ${rgbString}; color: ${textColor}">
                    Gray: ${actualGray}
                </div>
                <div class="color-details">
                    RGB: ${r}, ${g}, ${b}<br>
                    HEX: ${hexString}
                </div>
            `;
            
            // クリックでコピー機能
            colorItem.addEventListener('click', function() {
                navigator.clipboard.writeText(hexString).then(() => {
                    showNotification(`カラーコードをコピーしました: ${hexString}`, 'success', 2000);
                }).catch(err => {
                    console.error('コピーに失敗しました:', err);
                    showNotification('コピーに失敗しました', 'error');
                });
            });
            
            colorGrid.appendChild(colorItem);
        });
    }

    // カラフルテキストを更新する関数
    function updateColorfulText(colors) {
        // 色が指定されていない場合は現在の色を使用
        if (colors) {
            textColors = colors;
        } else if (textColors.length === 0) {
            const grayValue = parseInt(grayValueInput.value);
            const textColorCount = 50;
            textColors = generateEquivalentColors(grayValue, textColorCount);
        }
        
        // テキストとフォントサイズを取得
        const text = displayTextInput.value;
        const fontSize = fontSizeInput.value;
        
        // テキストプレビューをクリア
        textPreview.innerHTML = '';
        textPreview.style.fontSize = `${fontSize}px`;
        
        // テキストが空の場合はサンプルテキストを表示
        if (!text.trim()) {
            textPreview.textContent = 'テキストを入力してください';
            return;
        }
        
        // 改行で分割して処理
        const lines = text.split('\n');
        
        // 各行を処理
        lines.forEach((line, lineIndex) => {
            // 改行ではない場合のみ処理（最後の行以外）
            if (lineIndex > 0) {
                textPreview.appendChild(document.createElement('br'));
            }
            
            // 各文字に色を適用
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                // 空白文字の場合は特別処理
                if (char === ' ') {
                    textPreview.appendChild(document.createTextNode(' '));
                    continue;
                }
                
                // パターンによって色の選択方法を変える
                let colorIndex;
                switch (colorPattern) {
                    case 'random':
                        // ランダムな色
                        colorIndex = Math.floor(Math.random() * textColors.length);
                        break;
                    case 'gradient':
                        // グラデーション（行ごとに同じパターン）
                        const lineLength = line.length || 1;
                        const position = i / lineLength;
                        colorIndex = Math.floor(position * textColors.length);
                        break;
                    case 'sequential':
                    default:
                        // 連続した色（行ごとにオフセット）
                        const offset = lineIndex * 3; // 行ごとに色の開始位置をずらす
                        colorIndex = (i + offset) % textColors.length;
                }
                
                const color = textColors[colorIndex];
                const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
                
                // 文字のスパン要素を作成
                const span = document.createElement('span');
                span.className = 'color-char';
                span.textContent = char;
                span.style.color = colorString;
                
                // 文字間の間隔をランダムに調整
                const letterSpacing = Math.floor(Math.random() * 3);
                span.style.marginLeft = `${letterSpacing}px`;
                span.style.marginRight = `${letterSpacing}px`;
                
                // ホバー時に色の情報を表示するツールチップ
                span.title = `RGB: ${color.r}, ${color.g}, ${color.b}\nHEX: ${rgbToHex(color.r, color.g, color.b)}`;
                
                textPreview.appendChild(span);
            }
        });
    }

    // RGB値をHEXに変換する関数
    function rgbToHex(r, g, b) {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    // 図形を生成する関数
    function generateShapes(shapeType) {
        // プレビューをクリア
        shapePreview.innerHTML = '';
        
        // 設定値を取得
        const count = parseInt(shapeCountInput.value);
        const size = parseInt(shapeSizeInput.value);
        
        // 現在のグレー値で色を生成
        const shapeColors = generateEquivalentColors(currentGrayValue, count);
        
        // 図形の種類に応じて生成処理を分岐
        switch(shapeType) {
            case 'circles':
                generateCircles(shapeColors, count, size);
                break;
            case 'squares':
                generateSquares(shapeColors, count, size);
                break;
            case 'triangles':
                generateTriangles(shapeColors, count, size);
                break;
            case 'random':
                generateRandomShapes(shapeColors, count, size);
                break;
            case 'pattern':
                generatePattern(shapeColors, count, size);
                break;
            default:
                generateCircles(shapeColors, count, size);
        }
    }

    // 円を生成
    function generateCircles(colors, count, size) {
        const containerWidth = shapePreviewContainer.offsetWidth - size;
        const containerHeight = shapePreviewContainer.offsetHeight - size;
        
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'shape circle';
            
            // ランダムな位置
            const left = Math.random() * containerWidth;
            const top = Math.random() * containerHeight;
            
            // ランダムなサイズ（基本サイズの70%～130%）
            const actualSize = size * (0.7 + Math.random() * 0.6);
            
            // 色を設定
            const colorIndex = i % colors.length;
            const color = colors[colorIndex];
            const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            // スタイル設定
            div.style.left = `${left}px`;
            div.style.top = `${top}px`;
            div.style.width = `${actualSize}px`;
            div.style.height = `${actualSize}px`;
            div.style.backgroundColor = colorString;
            
            // ツールチップに色情報
            div.title = `RGB: ${color.r}, ${color.g}, ${color.b}`;
            
            shapePreview.appendChild(div);
        }
    }

    // 四角形を生成
    function generateSquares(colors, count, size) {
        const containerWidth = shapePreviewContainer.offsetWidth - size;
        const containerHeight = shapePreviewContainer.offsetHeight - size;
        
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'shape square';
            
            // ランダムな位置
            const left = Math.random() * containerWidth;
            const top = Math.random() * containerHeight;
            
            // ランダムなサイズ
            const actualSize = size * (0.7 + Math.random() * 0.6);
            
            // 色を設定
            const colorIndex = i % colors.length;
            const color = colors[colorIndex];
            const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            // 少しランダムに回転
            const rotation = Math.random() * 45 - 22.5;
            
            // スタイル設定
            div.style.left = `${left}px`;
            div.style.top = `${top}px`;
            div.style.width = `${actualSize}px`;
            div.style.height = `${actualSize}px`;
            div.style.backgroundColor = colorString;
            div.style.transform = `rotate(${rotation}deg)`;
            
            // ツールチップに色情報
            div.title = `RGB: ${color.r}, ${color.g}, ${color.b}`;
            
            shapePreview.appendChild(div);
        }
    }
    
    // 三角形を生成
    function generateTriangles(colors, count, size) {
        const containerWidth = shapePreviewContainer.offsetWidth - size;
        const containerHeight = shapePreviewContainer.offsetHeight - size;
        
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'shape triangle';
            
            // ランダムな位置
            const left = Math.random() * containerWidth;
            const top = Math.random() * containerHeight;
            
            // ランダムなサイズ
            const actualSize = size * (0.7 + Math.random() * 0.6);
            
            // 色を設定
            const colorIndex = i % colors.length;
            const color = colors[colorIndex];
            const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            // ランダムに回転
            const rotation = Math.random() * 360;
            
            // スタイル設定
            div.style.left = `${left}px`;
            div.style.top = `${top}px`;
            div.style.borderWidth = `0 ${actualSize / 2}px ${actualSize}px ${actualSize / 2}px`;
            div.style.borderColor = `transparent transparent ${colorString} transparent`;
            div.style.transform = `rotate(${rotation}deg)`;
            
            // ツールチップに色情報
            div.title = `RGB: ${color.r}, ${color.g}, ${color.b}`;
            
            shapePreview.appendChild(div);
        }
    }
    
    // ランダムな図形を生成
    function generateRandomShapes(colors, count, size) {
        const containerWidth = shapePreviewContainer.offsetWidth - size;
        const containerHeight = shapePreviewContainer.offsetHeight - size;
        
        for (let i = 0; i < count; i++) {
            // ランダムに図形タイプを選択
            const shapeTypes = ['circle', 'square', 'triangle'];
            const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            
            const div = document.createElement('div');
            div.className = `shape ${shapeType}`;
            
            // ランダムな位置
            const left = Math.random() * containerWidth;
            const top = Math.random() * containerHeight;
            
            // ランダムなサイズ
            const actualSize = size * (0.5 + Math.random() * 1);
            
            // 色を設定
            const colorIndex = Math.floor(Math.random() * colors.length);
            const color = colors[colorIndex];
            const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            // ランダムに回転
            const rotation = Math.random() * 360;
            
            // スタイル設定
            div.style.left = `${left}px`;
            div.style.top = `${top}px`;
            
            if (shapeType === 'triangle') {
                div.style.borderWidth = `0 ${actualSize / 2}px ${actualSize}px ${actualSize / 2}px`;
                div.style.borderColor = `transparent transparent ${colorString} transparent`;
            } else {
                div.style.width = `${actualSize}px`;
                div.style.height = `${actualSize}px`;
                div.style.backgroundColor = colorString;
            }
            
            div.style.transform = `rotate(${rotation}deg)`;
            
            // ツールチップに色情報
            div.title = `RGB: ${color.r}, ${color.g}, ${color.b}`;
            
            shapePreview.appendChild(div);
        }
    }
    
    // パターンを生成
    function generatePattern(colors, count, size) {
        // グリッドコンテナを作成
        const container = document.createElement('div');
        container.className = 'pattern-container';
        
        // グリッドの行と列の数を計算
        const gridSize = Math.ceil(Math.sqrt(count));
        
        // グリッドのスタイルを設定
        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        // グリッドアイテムを生成
        for (let i = 0; i < count && i < gridSize * gridSize; i++) {
            const item = document.createElement('div');
            item.className = 'pattern-item';
            
            // 色を設定
            const colorIndex = i % colors.length;
            const color = colors[colorIndex];
            const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            item.style.backgroundColor = colorString;
            
            // ツールチップに色情報
            item.title = `RGB: ${color.r}, ${color.g}, ${color.b}`;
            
            container.appendChild(item);
        }
        
        shapePreview.appendChild(container);
    }

    // 初期化
    initColorPicker();
}); 