const slides_2 = document.querySelector(".slides_2");
const slide_2 = document.querySelectorAll(".slides_2 .slide_2");
const prevBtn_2 = document.getElementById("prevBtn2");
const nextBtn_2 = document.getElementById("nextBtn2");

let index2 = 0;

function updateSlider2() {
    slides_2.style.transform = `translateX(-${index2 * 35}%)`;
    slides_2.style.transition = "transform 0.5s ease"; 
}

prevBtn_2.addEventListener("click", () => {
    if (index2 === 0) {
        setTimeout(() => {
            index2 = slide_2.length - 3;
            slides_2.style.transition = "none"; 
            updateSlider2(); 
        }, 500);
    }
    index2 = index2 > 0 ? index2 - 1 : slide_2.length - 1;
    updateSlider2();
});

nextBtn_2.addEventListener("click", () => {
    if (index2 === slide_2.length - 3) {
        setTimeout(() => {
            index2 = 0;
            slides_2.style.transition = "none"; 
            updateSlider2();
        }, 500);
    }
    index2 = index2 < slide_2.length - 1 ? index2 + 1 : 0;
    updateSlider2();
});