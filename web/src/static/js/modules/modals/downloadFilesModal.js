import {state} from '../state';
import {showModal} from './showModal';
import {sendData} from "../sendData";
import {submitData} from "../submitOrdersData";
import {appAddr} from "../../../../../../appAddr";


export const filesModal = `
   <div id='modal' class='modal bounceIn'>
        <div class='modal_content drop-area'>
            <input class="hidden__input" type="text" id="modal-files__current">
            <div class='modal__header modal-header'>
                <div class='modal-header__db'></div>
                <div class='modal-header__number'></div>
                <div class='modal-header__enter'></div>
            </div>
        
            <form class='order__files' method='POST' action='/api/files/save-files' enctype='multipart/form-data'>
             <div class='modal__trigger'>Укажите файлы для загрузки</div>
             <input class='modal__files hidden__input' type='file' name='files' multiple tabindex='-1'>
            </form>
            
            <div class='data'>
            </div>
        </div>
   </div>
`

const DATA_SOURCE = `${appAddr}/assets/uploads/`
const deleteFiles = () => {
  const files = document.querySelectorAll('.data__file')
  if (files[0] !== null) {
    files.forEach(file => {
      file.remove()
    })
  }
}

const sendFiles = (files, filesInput, old, id, parent) => {
  const formData = new FormData()
  for (let file of files) {
    console.log(file)
    formData.append('files', file)
  }

  const drop = document.querySelector('.modal__trigger')
  drop.textContent = 'Идет загрузка файлов'

  fetch(`${appAddr}/api/files/save-files`, {
    method: 'POST',
    body: formData
  }).then(res => res.json()).then(data => {
    const currentData = filesInput.value.split(', ')
    let newData = currentData.concat(data.data).filter(file => file !== '')
    newData = [...new Set(newData)]
    filesInput.value = newData.join(', ')
    console.log(filesInput)
    drop.classList.add('success')
    drop.textContent = 'Файлы успешно загружены'
    deleteFiles()
    drawFiles(document.querySelector('.modal'), filesInput.value, id, filesInput, parent)
    if (parent.classList.contains('table-form--old')) {
      parent.classList.remove('table-form--old')
      parent.classList.add('table-form--upd')
    }
    setTimeout(() => {
      drop.classList.remove('success')
      drop.textContent = 'Укажите файлы для загрузки'
    }, 1000)
  })
}

export function triggerFilesModal(e) {
  const parent = e.target.closest('ul')
  const old = parent.parentNode.classList.contains('table-form--old')
  const db = parent.querySelector('#db_id').value
  const enter = parent.querySelector('#timestamp').value
  const number = parent.querySelector('#number').value
  const modalElem = showModal(filesModal)
  const modalHeader = modalElem.querySelector('.modal__header')
  modalHeader.querySelector('.modal-header__db').textContent = '№' + db
  modalHeader.querySelector('.modal-header__number').textContent = '№ заказа ' + number
  modalHeader.querySelector('.modal-header__enter').textContent = enter

  const filesInputData = modalElem.querySelector('#modal-files__current')
  const orderFilesData = parent.querySelector('input[name="files"]')
  filesInputData.value = orderFilesData.value

  modalElem.addEventListener('click', ev => {
    if (ev.target === modalElem) {
      orderFilesData.value = filesInputData.value
      submitData()
    }
  })

  console.log(modalElem)

  const downloadTrigger = document.querySelector('.modal__trigger')

  if (!state['operCheck'] && !state['isArchive']) {
    downloadTrigger.addEventListener('click', e => {
      const filesInput = document.querySelector('.modal__files')
      filesInput.addEventListener('change', e => {
        const files = e.target.files
        sendFiles(files, filesInputData, old, db, orderFilesData.closest('form'))
      })
      filesInput.click()
    })

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      downloadTrigger.addEventListener(eventName, e => {
        e.preventDefault()
        e.stopPropagation()
      })
    })

    downloadTrigger.addEventListener('drop', e => {
      let dt = e.dataTransfer
      let files = dt.files
      sendFiles(files, filesInputData, old, db, orderFilesData.closest('form'))
    })

    modalElem.querySelector('.order__files').addEventListener('submit', e => {
      e.preventDefault()
      const filesData = document.querySelector('.modal__files')
      sendFiles(filesData.files, filesInputData, old, db, orderFilesData.closest('form'))
    })
  } else {
    downloadTrigger.remove()
  }
  drawFiles(modalElem, filesInputData.value, db, filesInputData, orderFilesData.closest('form'))
}

export const drawFiles = (modal, files, id, filesInput, parent) => {
  const data = modal.querySelector('.data')

  if (files.length) {
    const fileNames = []
    files.split(', ').map(file => {
      const arrDotFile = file.split('.')
      const fileType = arrDotFile[arrDotFile.length - 1]
      const arrSlashFile = file.split('/')
      arrSlashFile.splice(0, 3)
      const fileName = arrSlashFile.join('')
      let fileNameWithoutType = fileName.split('.')
      fileNameWithoutType = fileNameWithoutType.splice(0, fileNameWithoutType.length - 1).join('.')

      switch (fileType) {
        case 'pdf':
        case 'PDF':
        case 'dxf':
        case 'DXF':
          fileNames.push(fileNameWithoutType)
          data.insertAdjacentHTML(`beforeend`, `
            <div class='data__file'>
              <a target='_blank' class='file__original' href='${DATA_SOURCE}${fileNameWithoutType}.${fileType}'>Оригинал</a>
              <a target='_blank' class='link__preview' href='${DATA_SOURCE}${fileName.toLowerCase().endsWith(".pdf") ? fileName : fileNameWithoutType + ".png"}'>
                  <img class='file__preview' src='${DATA_SOURCE}${fileNameWithoutType}.png' alt=''>
              </a>
              <a class='file__download' href='${DATA_SOURCE}${fileNameWithoutType}.${fileType}' download>
                  <svg data-v-42a4bff7 xmlns='http://www.w3.org/2000/svg' class='download-icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path data-v-42a4bff7='' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'>
                      </path>
                  </svg>
              </a>
              <div class="file__remove">
                  +
              </div>
              <p class='file__name'>${fileName}</p>
            </div>
          `)
          break
        case 'png':
        case 'PNG':
          if (!fileNames.includes(fileNameWithoutType)) {
            data.insertAdjacentHTML(`beforeend`, `
              <div class='data__file'>
                    <a target='_blank' class='link__preview' href='${appAddr}/${file}'>
                        <img class='file__preview' src='${appAddr}/${file}' alt=>
                    </a>
                    <a class='file__download' href='http://${file}' download>
                         <svg data-v-42a4bff7 xmlns='http://www.w3.org/2000/svg' class='download-icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path data-v-42a4bff7='' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'>
                            </path>
                         </svg>
                    </a>
                    <div class="file__remove">
                        +
                    </div>
                    <p class='file__name'>${fileName}</p>
              </div>
            `)
          }
          break
        default:
          data.insertAdjacentHTML(`beforeend`, `
              <div class='data__file'>
                    <a target='_blank' class='link__preview' href='${appAddr}/${file}'>
                        <img class='file__preview' src='${appAddr}/${file}' alt=>
                    </a>
                    <a class='file__download' href='http://${file}' download>
                         <svg data-v-42a4bff7 xmlns='http://www.w3.org/2000/svg' class='download-icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path data-v-42a4bff7='' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'>
                            </path>
                         </svg>
                    </a>
                    <div class="file__remove">
                        +
                    </div>
                    <p class='file__name'>${fileName}</p>
              </div>
            `)
      }
    })

    let newData = filesInput.value.split(', ')

    document.querySelectorAll(".file__remove").forEach(btn => {
      btn.addEventListener('click', e => {
        const file = e.target.parentNode
        const fileName = file.querySelector('.file__name').textContent
        const drop = modal.querySelector('.modal__trigger')

        newData = newData.filter(data => data === fileName)
        filesInput.value = newData.join(', ')

        sendData(`${appAddr}/api/files/remove-file/${id}/${fileName}`, 'POST', null)
          .then(res => {
            if (res.ok) {
              file.remove()
              drop.textContent = 'Файл успешно удалён'
              drop.classList.add('success')

              if (parent.classList.contains('table-form--old')) {
                parent.classList.remove('table-form--old')
                parent.classList.add('table-form--upd')
              }

              setTimeout(() => {
                drop.classList.remove('success')
                drop.textContent = 'Укажите файлы для загрузки'
              }, 1000)
            }
          })
      })

      // submitData()
    })

    const btn = modal.querySelector('.file__all')
    if (btn !== null) {
      btn.remove()
    }
    data.closest('.modal_content').insertAdjacentHTML('beforeend', `
        <button class='file__all main__button'>Скачать всё</button>
    `)
    document.querySelector('.file__all').addEventListener('click', () => {
      document.querySelectorAll('.file__download').forEach(file => {
        file.click()
      })
    })
  }
}
