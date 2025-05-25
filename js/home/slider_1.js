const slides = document.querySelector(".slides");
const slide = document.querySelectorAll(".slides .slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let index = 0;

function updateSlider1() {
    slides.style.transform = `translateX(-${index * 35}%)`;
    slides.style.transition = "transform 0.5s ease"; 
}

prevBtn.addEventListener("click", () => {
    if (index === 0) {
        setTimeout(() => {
            index = slide.length - 3;
            slides.style.transition = "none"; 
            updateSlider1(); 
        }, 500);
    }
    index = index > 0 ? index - 1 : slide.length - 1;
    updateSlider1();
});

nextBtn.addEventListener("click", () => {
    if (index === slide.length - 3) {
        setTimeout(() => {
            index = 0;
            slides.style.transition = "none"; 
            updateSlider1();
        }, 500);
    }
    index = index < slide.length - 1 ? index + 1 : 0;
    updateSlider1();
});