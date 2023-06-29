import {subCommentByEnter} from "./routesModal";

export const showModal = modal => {
    const body = window.document.body
    // let modalElem = document.querySelector('.modal')
    // if (modalElem === null) {
    body.insertAdjacentHTML('afterbegin', modal)
    // }

    const modalElem = document.querySelector('.modal')
    modalElem.classList.add('modal_vis')
    modalElem.classList.remove('bounceOutDown')
    body.classList.add('body_block')
    modalElem.addEventListener('click', ev => {
        const target = ev.target
        if (target === modalElem) {
            modalElem.classList.add('bounceOutDown')
            modalElem.classList.remove('modal_vis')
            body.classList.remove('body_block')
            modalElem.remove()
            window.removeEventListener('keydown', subCommentByEnter)
        }
    })
    return modalElem
}