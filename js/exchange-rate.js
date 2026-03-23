async function fetchExchangeRate() {
    try {
        const apiKey = "2ccc581afbbdfaf5278942b0";
        const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/TWD`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.result === "success") {
            const jpyRate = data.conversion_rates.JPY;
            const now = new Date();
            const timeString = now.toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            document.getElementById("jpy-rate").innerHTML =
                `1 TWD = <span style="color:#ffeb3b">${jpyRate.toFixed(3)}</span> JPY`;
            document.getElementById("last-updated").innerHTML =
                `更新時間：${timeString}`;
        } else {
            document.getElementById("jpy-rate").innerHTML = "匯率獲取失敗";
        }
    } catch (error) {
        console.error("獲取匯率時發生錯誤:", error);
        document.getElementById("jpy-rate").innerHTML = "無法載入匯率";
    }
}

fetchExchangeRate();
setInterval(fetchExchangeRate, 300000);