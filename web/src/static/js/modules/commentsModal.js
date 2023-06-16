import {drawSubmit} from "./submitControl";
import {showModal} from "./showModal";

const commentModal = `
   <div id="modal" class="modal modal--comment bounceIn">
        <div class="modal_content">
            <h2 class="comment__title">Предыдущие комментарии</h2>
            <ul class="comments__prev comments-list">
            </ul>
            
            <h2 class="comment__title">Ваш комментарий</h2>
            <textarea class="comments__yours" name="comment" id="comments__yours"></textarea>    
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
        list.insertAdjacentHTML('beforeend', `
            <li class="comments-list__item">${comment}</li>
        `)
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
                <button class="comment__button" >Сохранить</button>    
            `)
            document.querySelector(".comment__button").addEventListener("click", ev => {
                const value = e.target.value
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
                    ev.target.textContent = 'Сохранить'
                }, 1000)
            })
        }
    })
}