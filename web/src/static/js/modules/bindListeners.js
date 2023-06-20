import {drawSubmit} from './submitControl';
import {state} from './state';

export const bindOrdersListeners = () => {
    document.querySelectorAll('.table__data').forEach(label => {
        if (!label.classList.contains('click-chose') && !label.classList.contains('click-select')) {
            setChooseListeners(label, 'focus', 'add', 'table__data--chosen')
            setChooseListeners(label, 'blur', 'remove', 'table__data--chosen')
            setChooseListeners(label, 'focus', 'show-current', 'table__data--current')
            setChooseListeners(label, 'blur', 'remove', 'table__data--current')
        } else if (!label.classList.contains('click-select')) {
            setChooseListeners(label, 'click', 'add', 'table__data--chosen')
        } else {
            setChooseListeners(label, 'click', 'toggle', 'table__data--chosen')
        }
    })
    document.querySelectorAll('.table__data').forEach(label => {
        label.addEventListener('change', e => {
            drawSubmit()
            const parent = e.target.closest('.table-form--old')

            if (parent !== null) {
                parent.classList.remove('table-form--old')
                parent.classList.add('table-form--upd')
            }
        })
    })
    document.querySelectorAll('input').forEach(el => {
        el.tabIndex = -1
        el.autocomplete = 'off'
    })
    document.querySelectorAll('button').forEach(el => {
        el.tabIndex = -1
    })
    document.querySelectorAll('a').forEach(el => {
        el.tabIndex = -1
    })
    document.querySelectorAll('select').forEach(el => {
        el.tabIndex = -1
    })
}

const setChooseListeners = (label, listener, action, cls) => {
    if (!label.classList.contains('table__data--clicker')) {
        label.addEventListener(listener, e => {
            const parent = e.target.closest('.main-table__item')
            parent.querySelectorAll('.table__data').forEach(item => {
                switch (action) {
                    case 'add':
                        if (!label.classList.contains('table__data--opened')) {
                            state['inWork'] = true
                            item.classList.add(cls)
                        }
                        break
                    case 'show-current':
                        state['inWork'] = true
                        e.target.classList.add(cls)
                        break
                    case 'toggle':
                        state['inWork'] = true
                        item.classList.toggle(cls)
                        break
                    default:
                        if (cls === 'table__data--current') {
                            state['inWork'] = false
                            item.classList.remove(cls)
                            return
                        }
                        if (!label.classList.contains('table__data--opened')) {
                            state['inWork'] = false
                            item.classList.remove(cls)
                        }
                }
            })
        })
    }
}
