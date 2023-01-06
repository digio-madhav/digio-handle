export function LazyLoadContent(url) {
    return new Promise((resolve, reject) => {
        let s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = url;
        let x = document.getElementsByTagName('head')[0];
        x.appendChild(s);

        s.onload = (() => {
            resolve();
        });
    });
}