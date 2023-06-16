import {drawSubmit} from "./submitControl";
import {showModal} from "./showModal";
import {user} from "../table";

const commentModal = `
   <div id="modal" class="modal modal--comment bounceIn">
        <div class="modal_content">
            <h2 class="comment__title">Предыдущие комментарии</h2>
            <ul class="comments__prev comments-list">
            </ul>
            
            <h2 class="comment__title">Ваш комментарий</h2>
            <textarea class="comments__yours main__input" name="comment" id="comments__yours"></textarea>    
        </div>
   </div>
`

const deleteComments = () => {
    const comments = document.querySelectorAll(".comments-list__item")
    if (comments !== null) {
        comments.forEach(c => {
            c.remove()
        })
    }
}

const drawComments = (list, comments) => {
    comments.forEach(comment => {
        let comm = comment.split(" ")

        if (comm.length >= 4 && comm[3] !== "") {
            list.insertAdjacentHTML('afterbegin', `
                <li class="comments-list__item">${comment}</li>
            `)
        }
    })
}

export const triggerCommentsModal = e => {
    const modalElem = showModal(commentModal)
    const commentElem = modalElem.querySelector("#comments__yours")
    const commentsList = modalElem.querySelector(".comments__prev")
    const parent = e.target.closest("form")
    const visibleComment = parent.querySelector("input[name='comment']")
    const comments = parent.querySelector("input[name='all_comments']")
    const newComments = parent.querySelector("input[name='comments']")
    const commentsArr = comments.value.split(".-.")
    const newCommentsArr = newComments.value.split(".-.")
    drawComments(commentsList, commentsArr)
    commentElem.addEventListener("input", e => {
        const btn = document.querySelector(".comment__button")
        if (btn === null && e.target.value !== "") {
            commentElem.insertAdjacentHTML('afterend', `
                <button class="main__button comment__button" >Сохранить</button>    
            `)
            document.querySelector(".comment__button").addEventListener("click", ev => {
                let value = e.target.value
                let today = new Date(Date.now()).toISOString()
                today = today.substring(0, today.length - 8)

                value = `${today} ${user.name} ${value}`

                commentsArr.push(value)
                newCommentsArr.push(value)
                comments.value = commentsArr.join(".-.")
                newComments.value = newCommentsArr.filter(c => c !== "").join(".-.")
                visibleComment.value = value
                ev.target.textContent = 'Успешно'
                e.target.value = ''
                deleteComments()
                drawComments(commentsList, commentsArr)
                drawSubmit()
                if (parent.classList.contains("table-form--old")) {
                    parent.classList.remove("table-form--old")
                    parent.classList.add("table-form--upd")
                }
                setTimeout(() => {
                    ev.target.remove()
                }, 1000)
            })
        } else if (e.target.value === "") {
            document.querySelector(".comment__button").remove()
        }
    })
}