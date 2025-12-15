import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', 
    withCredentials: true, // include cookies in requests (required for cross-site cookies)
});

export default instance;