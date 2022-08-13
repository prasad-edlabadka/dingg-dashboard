export default function callAPI(url: string, token: string, setToken: any, cb: any) {
    const requestMetadata = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    };
    fetch(url, requestMetadata)
        .then(res => res.status === 401? setToken(null):res.json())
        .then(data => {
            cb(data);
        });
}