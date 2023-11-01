import {state} from "../../modules/state";
import {getOrders} from "../../modules/getOrders";
import {newAllFilter} from "../../modules/filters/newAllFilter";
import {getPlans} from "../getPlans";
import {newAllPlanFilter} from "./newAllPlanFilter";

export const controlPlanFiltersReset = () => {
  if (state['filtered']) {
    const nav = document.querySelector('.main-header__nav')
    const resetBtn = nav.querySelector('.header-button__reset')
    const loader = document.querySelector('.spinner-loader')

    if (resetBtn === null) {
      loader.insertAdjacentHTML('beforebegin', `
          <button class='main__button--click main-header__button header-button__reset' tabindex='-1'>Сбросить фильтры</button>
      `)

      nav.querySelector('.header-button__reset').addEventListener('click', e => {
        state['filtered'] = false
        state['searched'] = false
        state['tableFilters'] = {}
        // document.querySelectorAll('.route__filter--chosen').forEach(filt => filt.classList.remove('route__filter--chosen'))

        getPlans('get-all', true)
        newAllPlanFilter()
      })
    }
  } else {
    const resetBtn = document.querySelector('.header-button__reset')
    if (resetBtn !== null) {
      resetBtn.remove()
    }
  }
}