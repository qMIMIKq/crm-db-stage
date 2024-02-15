import {drawSubmit} from '../submitControl';
import {showModal} from './showModal';
import {user} from '../../table';
import {submitData} from "../submitOrdersData";
import {state} from "../state";
import {getTime} from "../getTime";

const commentModal = `
   <div id='modal' class='modal modal--comment bounceIn'>
        <div class='modal_content modal_content--comments'>
            <div class='modal__header modal-header'>
                <h2 class='comments__title'>Комментарии</h2>                
            </div>
        
            <div class="comments-content">
              <ul class='comments__prev comments-list'>
              </ul>
              
              <div class="comments__add">
                <input placeholder="Напишите комментарий" class='comments__yours route__input main__input' name='comment' id='comments__yours'/>    
                <button disabled class='main__button comment__button route__btn send__comment' >Сохранить</button>   
              </div>
            </div>
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

  commentElem.focus()

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
          newComments.value = ""
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

    modalElem.click()
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