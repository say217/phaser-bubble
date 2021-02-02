export const getResolution = () => {
    let isMobile = navigator.userAgent.indexOf("Mobile");
    if(isMobile == -1){
        isMobile = navigator.userAgent.indexOf("Tablet");
    }
    let w = 1280;
    let h = 720;
    if(isMobile !== -1){
        w = window.innerWidth;
        h = window.innerHeight;
    }
    return {width: w, height: h};
}