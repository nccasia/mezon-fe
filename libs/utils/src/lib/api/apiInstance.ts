import axios from 'axios';
const baseURL = process.env.NX_MEZON_FLOW_URL ?? '';
const apiInstance = axios.create({
	baseURL,
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
});
apiInstance.interceptors.request.use((config) => {
	// if (getCookie('accessToken') !== undefined) {
	// 	config.headers.Authorization = 'Bearer ' + String(getCookie('accessToken'));
	// }
	return config;
});
apiInstance.interceptors.response.use(
	(response) => {
		return response.data;
	},
	async (error) => {
		if (error.response?.status === 401) {
			window.location.href = '/login';
		}
		return await Promise.reject(error);
	}
);
export { apiInstance };
