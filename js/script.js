let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    if (songs.length > 0) {

        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + ` <li><img class="invert" width="30" src="img/music.svg" alt="">
                        <div class="info flex justify-center items-center">
                        <div class="songname-in-list"> ${song.replaceAll("%20", " ")}</div>
                        </div>
                            <div class="playnow">
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;

        }
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // clear previous styles
            removeStyles()

            e.style.backgroundColor = "rgba(101, 101, 101, 0.557)"
            e.querySelector(".playnow").getElementsByTagName("img")[0].src = "img/pause.svg"

            playMusic(e.querySelector(".info .songname-in-list").innerHTML.trim())
        })
    })
    return songs
}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let barsContainer = document.querySelector(".bars-container")
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {

            let folder = e.href.split("/").slice(-2)[0]

            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
            <div class="details">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            </div>
        </div>`

            // 6 because fetch function always take 1st folder as empty so for i=0 it will not enter in if statement at line no.82
            if (i <= 6) {
                barsContainer.innerHTML = barsContainer.innerHTML + `<div data-folder="${folder}" class="bar">
                    <div><img src="/songs/${folder}/cover.jpg" alt="img"></div>
                    <p>${response.title}</p>
                </div>`
            }
        }
    }

    // Load the playlist whenever card is clicked
    let cards = Array.from(document.getElementsByClassName("card"))
    cards.forEach(e => {
        let unavailable = document.querySelector(".songlist").getElementsByTagName("p")[0]
        let songImgInPlaybar = document.querySelector(".playbar .songimg>img")

        e.addEventListener("click", async item => {
            currentSong.currentTime = 0
            // display the album cover which is active
            songImgInPlaybar.removeAttribute("hidden")
            songImgInPlaybar.src = "songs/" + e.querySelector("img").src.split("/songs/")[1]

            // remove styles from selected album
            Array.from(document.getElementsByClassName("card")).forEach(e => {
                e.removeAttribute("style")
                e.querySelector(".play").removeAttribute("style")
            })
            // add styles to newly selected album
            e.style = "background-color: rgb(69, 68, 68);transform: scale(1.04);"
            e.querySelector(".play").style = "bottom:33%;opacity:1"

            // click the corresponding bar according to index
            let index = cards.findIndex(item => item == e)
            document.getElementsByClassName("bar")[index].click()

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            if (songs.length > 0) {
                document.querySelector(".songlist").getElementsByTagName("li")[0].style.backgroundColor = "rgba(101, 101, 101, 0.557)"
                document.querySelector(".playnow").getElementsByTagName("img")[0].src = "img/pause.svg"
                unavailable.style.zIndex = "-10"

                playMusic(songs[0])
            }
            else {
                currentSong.pause()
                play.src = "img/play.svg"
                unavailable.style.zIndex = "1"
            }

        })
    })

    // event listener on bars
    let bars = Array.from(document.getElementsByClassName("bar"))
    bars.forEach(e => {
        e.addEventListener("click", () => {
            Array.from(document.getElementsByClassName("bar")).forEach(e => { e.removeAttribute("style") })
            e.style = "transform: scale(0.98);background-color: #000000ac;"

            // clicking the corresponding card from albums
            let index = bars.findIndex(item => item == e)
            document.getElementsByClassName("card")[index].click()
        })

    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    if (track) {
        document.querySelector(".playbar .songname").innerHTML = decodeURI(track)
    }

}

async function main() {

    // Display all the albums on the page
    await displayAlbums()

    // listen for clicking buttons
    document.addEventListener("keydown", (e) => {
        // clicking soace button
        if (currentSong.src) {
            if (e.key == " ") {
                e.preventDefault()
                play.click()
            }
            // clicking left arrow key
            if (e.key == "ArrowLeft") {
                e.preventDefault()
                previous.click()
            }
            // clicking right arrow key
            if (e.key == "ArrowRight") {
                e.preventDefault()
                next.click()
            }
        }

    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        const percent = (currentTime / duration) * 100;

        document.querySelector(".songtime").getElementsByTagName("span")[0].innerHTML = `${secondsToMinutesSeconds(currentTime)}`;
        document.querySelector(".songtime").getElementsByTagName("span")[1].innerHTML = `${secondsToMinutesSeconds(duration)}`;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progres").style.width = percent + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progres").style.width = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });



    // // Add an event listener for hamburger
    // document.querySelector(".hamburger").addEventListener("click", () => {
    //     document.querySelector(".left").style.left = "0"
    // })


    // Add an event listener for close button
    // document.querySelector(".close").addEventListener("click", () => {
    //     document.querySelector(".left").style.left = "-120%"
    // })

    // Attach an event listener to play plause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        currentSong.currentTime = 0

        let currentSongName = currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")

        // styles removed from selected song
        removeStyles()
        // adding styles by clicking the previous song with click method in songlist which will automatically play it
        let arrayOfSongsInList = Array.from(document.querySelector(".songlist").getElementsByTagName("li"))
        let index = arrayOfSongsInList.findIndex(song => song.innerText.includes(currentSongName))

        if (index == 0) arrayOfSongsInList[arrayOfSongsInList.length - 1].click()
        else arrayOfSongsInList[index - 1].click()

    })


    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        currentSong.currentTime = 0

        let currentSongName = currentSong.src.split("/").slice(-1)[0].replaceAll("%20", " ")

        // styles removed from selected song
        removeStyles()

        // adding styles by clicking the next song in songlist which will automatically play it
        let arrayOfSongsInList = Array.from(document.querySelector(".songlist").getElementsByTagName("li"))
        let index = arrayOfSongsInList.findIndex(song => song.innerText.includes(currentSongName))

        if (index == arrayOfSongsInList.length - 1) arrayOfSongsInList[0].click()
        else arrayOfSongsInList[index + 1].click()

    })

    // Add an event to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })
    // removing previous styles from songlist

}

main()

function removeStyles() {
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(all => {
        all.style.backgroundColor = "transparent"
        all.querySelector(".playnow").getElementsByTagName("img")[0].src = "img/play.svg"
    })
}