import {getAndDrawData} from "./adminHandler";
import {appAddr} from "../../../../../../appAddr";
import {topFiltersHandler} from "../filters/topFilters";

let filters = []

const submitFilters = async (data) => {
  await fetch(`${appAddr}/api/filters/edit-position`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  topFiltersHandler()
}

export const drawConstructor = (modal, datas) => {
  const topColumns = modal.querySelector('.nav-content__columns')
  const itemColumns = modal.querySelector('.nav-content__items')

  topColumns.classList.remove('hidden-input')
  itemColumns.classList.remove('hidden-input')

  topColumns.insertAdjacentHTML('afterbegin', `
    <li class="nav-content__column users-columns__name">
        Фильтр
    </li>
  `)

  filters = datas.filter(d => !d.disable)

  filters.forEach((data, i) => {
    itemColumns.insertAdjacentHTML('beforeend', `
      <li id="filter-${data.id}" class="nav-content__item nav-item">
          <div class="nav-item__column users-item__name">
              <div class="nav-item__column">
                ${data.name}
              </div>
          </div>
          <div class="nav-item__column nav-item__pos nav-item__up">Выше</div>
          <div class="nav-item__column nav-item__pos nav-item__down">Ниже</div>
      </li>
    `)

    data.position = i

    const currElem = document.querySelector(`#filter-${data.id}`)
    const upBtn = currElem.querySelector('.nav-item__up')
    const downBtn = currElem.querySelector('.nav-item__down')

    upBtn.addEventListener('click', e => {
      const ind = filters.findIndex(filt => filt.id === data.id)

      if (ind === 0) {
        const temp = filters[filters.length - 1].position
        filters[filters.length - 1].position = filters[ind].position
        filters[ind].position = temp

        ;[filters[filters.length - 1], filters[ind]] = [filters[ind], filters[filters.length - 1]]
        submitFilters(filters)
          .then(() => {
            getAndDrawData('filters/get-all', drawConstructor, modal)
          })
      } else {
        const temp = filters[ind - 1].position
        filters[ind - 1].position = filters[ind].position
        filters[ind].position = temp

        ;[filters[ind - 1], filters[ind]] = [filters[ind], filters[ind - 1]]
        submitFilters(filters)
          .then(() => {
            getAndDrawData('filters/get-all', drawConstructor, modal)
          })
      }
    })

    downBtn.addEventListener('click', e => {
      const ind = filters.findIndex(filt => filt.id === data.id)
      console.log(filters.length, ind)

      if (ind + 1 === filters.length) {
        const temp = filters[0].position
        filters[0].position = filters[ind].position
        filters[ind].position = temp

        ;[filters[0], filters[ind]] = [filters[ind], filters[0]]
        submitFilters(filters).then(() => {
          getAndDrawData('filters/get-all', drawConstructor, modal)
        })
      } else {
        const temp = filters[ind + 1].position
        filters[ind + 1].position = filters[ind].position
        filters[ind].position = temp

        ;[filters[ind + 1], filters[ind]] = [filters[ind], filters[ind + 1]]
        submitFilters(filters).then(() => {
          getAndDrawData('filters/get-all', drawConstructor, modal)
        })
      }
    })
  })
}