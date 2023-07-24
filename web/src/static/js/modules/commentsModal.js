import {drawSubmit} from './submitControl';
import {showModal} from './showModal';
import {user} from '../table';
import {submitData} from "./submitOrdersData";
import {state} from "./state";
import {getTime} from "./getTime";

const commentModal = `
   <div id='modal' class='modal modal--comment bounceIn'>
        <div class='modal_content'>
            <h2 class='comment__title'>Предыдущие комментарии</h2>
            <ul class='comments__prev comments-list'>
            </ul>
            
            <h2 class='comment__title'>Ваш комментарий</h2>
            <textarea class='comments__yours main__input' name='comment' id='comments__yours'></textarea>    
            <button disabled class='main__button comment__button' >Сохранить</button>   
        </div>
   </div>
`

const deleteComments = () => {
  const comments = document.querySelectorAll('.comments-list__item')
  if (comments !== null) {
    comments.forEach(c => {
      c.remove()
    })
  }
}

const drawComments = (list, comments) => {
  comments.forEach(comment => {
    let comm = comment.split(' ')

    if (comm.length >= 4 && comm[3] !== '') {
      list.insertAdjacentHTML('afterbegin', `
        <li class='comments-list__item'>${comment}</li>
      `)
    }
  })
}

export const triggerCommentsModal = e => {
  const modalElem = showModal(commentModal)
  const commentElem = modalElem.querySelector('#comments__yours')
  const commentsList = modalElem.querySelector('.comments__prev')
  const parent = e.target.closest('form')
  const visibleComment = parent.querySelector('input[name="comment"]')
  const comments = parent.querySelector('input[name="all_comments"]')
  const newComments = parent.querySelector('input[name="comments"]')
  const commentsArr = comments.value.split('.-.')
  const newCommentsArr = newComments.value.split('.-.')
  drawComments(commentsList, commentsArr)

  const saveBtn = document.querySelector('.comment__button')
  saveBtn.addEventListener('click', ev => {
    let value = commentElem.value
    const today = getTime()
    const old = parent.classList.contains('table-form--old')

    value = `${today} ${user.nickname} ${value}`
    commentsArr.push(value)
    newCommentsArr.push(value)

    comments.value = commentsArr.join('.-.')
    newComments.value = newCommentsArr.filter(c => c !== '').join('.-.')
    visibleComment.value = value
    ev.target.textContent = 'Успешно'
    commentElem.value = ''
    deleteComments()

    modalElem.addEventListener('click', event => {
      if (event.target === modalElem) {
        if (old) {
          submitData()
        }
      }
    })

    drawComments(commentsList, commentsArr)
    if (old) {
      parent.classList.remove('table-form--old')
      parent.classList.add('table-form--upd')
    } else {
      drawSubmit()
    }

    setTimeout(() => {
      ev.target.textContent = 'Сохранить'
      ev.target.setAttribute('disabled', '')
    }, 1000)
  })
  commentElem.addEventListener('input', e => {
    if (e.target.value !== '') {
      saveBtn.removeAttribute('disabled')

    } else if (e.target.value === '') {
      saveBtn.setAttribute('disabled', '')
    }
  })

  if (state['isArchive']) {
    commentElem.remove()
    modalElem.querySelector('.comment__title').remove()
    modalElem.querySelector('.comment__button').remove()
  }
}