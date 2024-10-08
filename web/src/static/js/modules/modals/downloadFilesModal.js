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
             <input id="download_files_input" class='modal__files hidden__input' type='file' name='files' multiple tabindex='-1'>
             <input class="hidden-input" type="text" name="order_id" id="files_order_id">
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
  if (!files.length) return

  const randHash = `$-${String(Math.random()).slice(0, 10)}-$`
  console.log("sending")

  const formData = new FormData()
  formData.set("id", id)
  formData.set("hash", randHash)

  for (let file of files) {
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
  const plan = parent.parentNode.classList.contains('table-form--plan')
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

  const downloadTrigger = document.querySelector('.modal__trigger')
  if (!state['operCheck'] && !state['isArchive'] && !plan) {
    downloadTrigger.addEventListener('click', e => {
      const filesInput = document.querySelector('.modal__files')
      filesInput.addEventListener('change', e => {
        const files = e.target.files
        // for (let i = 0; i < files.length; i++) {
        //   console.log(files[i])
        // }

        sendFiles(files, filesInputData, old, db, orderFilesData.closest('form'))
        e.target.value = null
      })
      filesInput.click()
    })

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      downloadTrigger.addEventListener(eventName, e => {
        e.preventDefault()
        e.stopPropagation()

        switch (eventName) {
          case 'dragenter':
          case 'dragover':
            downloadTrigger.classList.add('drag-check')
            break
          case 'dragleave':
          case 'drop':
            downloadTrigger.classList.remove('drag-check')
        }
      })
    })

    downloadTrigger.addEventListener('drop', e => {
      const dt = e.dataTransfer
      const files = dt.files

      // for (let i = 0; i < files.length; i++) {
      //   console.log(files[i])
      // }

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
  console.log(files)
  const data = modal.querySelector('.data')
  const plan = parent.classList.contains('table-form--plan')

  if (files.length) {
    const fileNames = []
    files.split(', ').map(file => {

      const arrDotFile = file.split('.')
      const fileType = arrDotFile[arrDotFile.length - 1]
      const arrSlashFile = file.split('/')
      arrSlashFile.splice(0, 3)
      let fileName = arrSlashFile.join('/')
      let fileNameWithoutType = fileName.split('.')
      fileNameWithoutType = fileNameWithoutType.splice(0, fileNameWithoutType.length - 1).join('.')

      let visibleName
      if (fileName.includes('$-') && fileName.includes('-$')) {
        visibleName = arrSlashFile.splice(0, 4).join('').slice(15)
      }

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
              <p class='file__name'>${visibleName}</p>
              <p class='file__hashname hidden-input'>${fileName}</p>
            </div>
          `)
          break
        case 'png':
        case 'PNG':
          if (!fileNames.includes(fileNameWithoutType)) {
            data.insertAdjacentHTML(`beforeend`, `
              <div class='data__file'>
                    <a target='_blank' class='link__preview' href='${DATA_SOURCE}${fileNameWithoutType}.${fileType}'>
                        <img class='file__preview' src='${DATA_SOURCE}${fileNameWithoutType}.${fileType}' alt=>
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
                    <p class='file__name'>${visibleName}</p>
                    <p class='file__hashname hidden-input'>${fileName}</p>
              </div>
            `)
          }
          break
        default:
          data.insertAdjacentHTML(`beforeend`, `
              <div class='data__file'>
                    <a target='_blank' class='link__preview' href='${DATA_SOURCE}${fileNameWithoutType}.${fileType}'>
                        <img class='file__preview' src='${appAddr}/${file}' alt=>
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
                    <p class='file__name'>${visibleName}</p>
                    <p class='file__hashname hidden-input'>${fileName}</p>
              </div>
            `)
      }
    })

    let newData = filesInput.value.split(', ')
    console.log(newData)

    document.querySelectorAll(".file__remove").forEach(btn => {
      if (!plan && !state.operCheck) {
        btn.addEventListener('click', e => {
          const file = e.target.parentNode
          let fileText = file.querySelector('.file__hashname').textContent
          let fileName = `${DATA_SOURCE.replace(appAddr, '.')}${fileText}`
          const drop = modal.querySelector('.modal__trigger')

          let fileType = fileText.toLowerCase().split('.')
          fileType = fileType[fileType.length - 1]

          fileText = fileText.split('/')

          let checkID
          let urlFileName

          if (fileText.length > 1) {
            console.log('big ', fileText)
            checkID = fileText[0]
            urlFileName = fileText[1]
          } else {
            console.log('small ', fileText)
            checkID = id
            urlFileName = fileText[0]
          }

          newData = newData.filter(data => data !== fileName && data !== fileName.replace(`.${fileType}`, '.png'))

          filesInput.value = newData.join(', ')
          document.querySelector('#download_files_input').value = ''

          const reqUrl = `${appAddr}/api/files/remove-file/${checkID}/${urlFileName}`
          sendData(reqUrl, 'POST', null)
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
      } else {
        btn.remove()
      }

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
