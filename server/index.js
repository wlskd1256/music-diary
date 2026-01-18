// server/index.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors()); // 프론트엔드와 소통 허용

// 음악 검색 API (애플 아이튠즈 사용)
app.get('/api/search', async (req, res) => {
    const query = req.query.q; // 검색어 받기
    
    // 검색어가 없으면 빈 결과 반환
    if (!query) return res.json([]); 

    try {
        // 애플 서버에 요청 (키 필요 없음!)
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`;
        const response = await axios.get(url);
        
        // 검색 결과를 프론트엔드로 전달
        res.json(response.data.results);
    } catch (error) {
        console.error('검색 에러:', error);
        res.status(500).send('Error');
    }
});

app.listen(5000, () => console.log(' 애플 뮤직 서버 가동 (포트 5000)'));