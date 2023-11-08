import {state, userInf} from "../../modules/state";
import {getOrders, hideOrders} from "../../modules/getOrders";
import {getData} from "../../modules/getData";
import {globalFilterReports} from "./globalFilterReports";
import {ucFirst} from "../../ucFirst";
import {newAllReportFilter} from "./newAllReportFilter";
import {searchReportsHandler} from "./serchReportsHandler";

export const topReportFilter = () => {
  let filtered
  const plotFilters = document.querySelector('.nav-filters__plots')
  const filterFilters = document.querySelector('.nav-filters__filters')
  const selectUser = document.querySelector('.select-user')
  const nav = document.querySelector('.nav-filters')
  const extensions = ['все']

  const navControl = document.querySelector('.nav-control')
  const userName = navControl.querySelector('.nav-control__name')
  userName.textContent = userInf.nickname
  const userGroup = document.querySelector('.nav-control__group')
  userGroup.textContent = ucFirst(userInf.group)

  const burgerMenu = navControl.querySelector('.nav-control__burger')
  const navRoutes = navControl.querySelector('.nav-control__routes')
  const adminModalBtn = document.querySelector('.nav-control__admin')
  burgerMenu.addEventListener('click', () => {
    navControl.classList.toggle('nav-control--opened')
    navRoutes.classList.toggle('hidden__input')

    if (userInf.groupId === '1') {
      adminModalBtn.classList.toggle('hidden-input')
    } else {
      navRoutes.style.paddingBottom = '6px'
    }
  })

  const searchBtn = document.querySelector('.nav-control__search-btn')
  searchBtn.addEventListener('click', () => {
    searchReportsHandler()
  })

  const links = navControl.querySelectorAll('.nav-control__route-link')
  links.forEach(link => {
    link.addEventListener('click', () => {
      console.log(window.location.href)
      navControl.classList.toggle('nav-control--opened')
      navRoutes.classList.toggle('hidden__input')
      adminModalBtn.classList.toggle('hidden-input')

      if (link.textContent.trim().includes('Архив')) {
        sessionStorage.setItem('page', 'archive')
        window.location.href = link.querySelector('.hidden__input').value

        // getOrders('get-old')
      } else if (link.textContent.trim().includes('Главная')) {
        sessionStorage.setItem('page', 'main')
        window.location.href = link.querySelector('.hidden__input').value
        getOrders('get-all', true)
      } else {
        console.log(window.location.href)
        window.location.href = link.querySelector('.hidden__input').value
      }

    })
  })

  const checkExt = (extensions, ext) => {
    let flag = false
    extensions.forEach(d => {
      if (d === ext) {
        flag = true
      }
    })
    return flag
  }

  const drawTopPanel = (data, block, short) => {
    data.forEach(d => {
      let condition = !checkExt(extensions, d.name)
      if (condition) {
        if (short) {
          block.insertAdjacentHTML('beforeend', `
            <li class='nav-filters__item'>
                <button class='nav-filters__button main__button--click'>${d.short_name}</button>
                <input class='hidden__input' value="${d.name}"/>
             </li>
          `)
        } else {
          block.insertAdjacentHTML('beforeend', `
            <li class='nav-filters__item'>
                <button class='nav-filters__button main__button--click'>${d.name}</button>
             </li>
          `)
        }
      }
    })
  }

  const removeData = block => {
    block.innerHTML = ''
  }

  const plotListener = (block) => {
    const btns = block.querySelectorAll('button')
    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.target
        const plot = target.parentNode.querySelector('input').value

        if (!target.classList.contains('chosen__plot')) {
          state['currentTopPlots'].push(plot)
        } else {
          state['currentTopPlots'] = state['currentTopPlots'].filter(cP => cP !== plot)
        }

        target.classList.toggle('chosen__plot')
        target.classList.toggle('nav-filters__button--chosen')
        filterByPlots()

        if (state['currentTopFilters'].length) {
          newAllReportFilter()
          filtered = true
          controlFilterReset()
        } else {
          newAllReportFilter()

          filtered = false
          controlFilterReset()
        }
      })
    })
  }

  const filterByPlots = () => {
    state['currentTopFilters'] = state['topFilters'].filter(filt =>
      state['currentTopPlots'].includes(filt.plot)
    )

    removeData(filterFilters)
    if (state['currentTopFilters'].length) {
      drawTopPanel(state['currentTopFilters'], filterFilters)
    } else {
      drawTopPanel(state['topFilters'], filterFilters)
    }

    filterListener(filterFilters)
  }

  const removePlotsByUser = (plot, plots) => {
    const newPlots = []
    plots.forEach(f => {
      console.log(f)
      if (f.name === plot) {
        newPlots.push(f)
      }
    })

    removeData(plotFilters)
    drawTopPanel(newPlots, plotFilters)
  }

  const filterListener = block => {
    block.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.target
        const filter = target.textContent

        if (!target.classList.contains('chosen__filter')) {
          if (!document.querySelector('.chosen__plot')) {
            state['currentTopFilters'].push({'name': filter})
          } else {
            state['currentTopFilters'] = [{'name': filter}]
          }

        } else {
          state['currentTopFilters'] = state['currentTopFilters'].filter(cF => cF.name !== filter)
        }

        target.classList.toggle('chosen__filter')
        target.classList.toggle('nav-filters__button--chosen')

        if (state['currentTopFilters'].length) {
          filtered = true
          newAllReportFilter()
          controlFilterReset()
        } else {
          filtered = false
          newAllReportFilter()
          controlFilterReset()
        }
      })
    })
  }

  const controlFilterReset = () => {
    const resetBtn = document.querySelector('.nav-filters__reset')
    if (filtered) {
      if (!resetBtn) {
        nav.insertAdjacentHTML('beforeend', `
            <button class='main__button--click main-header__button nav-filters__reset' tabindex='-1'>Сбросить фильтры</button>
        `)

        document.querySelector('.nav-filters__reset').addEventListener('click', () => {
          state['currentTopFilters'] = []
          document.querySelector('.nav-filters__reset').remove()

          newAllReportFilter()

          nav.querySelectorAll('.nav-filters__button').forEach(btn => {
            console.log(btn)
            btn.classList.remove('nav-filters__button--chosen')
            btn.classList.remove('chosen__plot')
            btn.classList.remove('chosen__filter')
          })
        })
      }
    } else {
      try {
        document.querySelector('.nav-filters__reset').remove()
      } catch {
      }
    }
  }

  const draw = async () => {
    let plots = []
    let filters = []

    await getData('filters/get-all')
      .then(data => {
        data.data = data.data.filter(d => !d.disable)

        drawTopPanel(data.data, filterFilters)
        filters = data.data
        state['topFilters'] = filters
      }).then(_ => filterListener(filterFilters))

    await getData('plots/get-all')
      .then(data => {
        drawTopPanel(data.data, plotFilters, true)
        plots = data.data
        state['topPlots'] = plots
      }).then(_ => plotListener(plotFilters))

    if (userInf.groupId === "5") {
      console.log(userInf.plot)
      state.topPlots = state.topPlots.filter(pl => pl.name === userInf.plot)
      state['topFilters'] = state['topFilters'].filter(filt => state.topPlots[0].name === filt.plot)

      removeData(plotFilters)
      removeData(filterFilters)

      drawTopPanel(state['topPlots'], plotFilters, true)
      drawTopPanel(state['topFilters'], filterFilters)

      plotListener(plotFilters)
      filterListener(filterFilters)

      console.log(state.topPlots)
      console.log(state.topFilters)
    }
  }
  draw()
}

export const filterRouteReports = () => {
  const filters = state['currentTopFilters'].map(filter => filter.name)

  state.filteredOrders = state.orders.filter(order => filters.includes(order.order_plot))

  console.log(state.filteredOrders)

  hideOrders()
  state['filteredOrders'].forEach(order => {
    globalFilterReports(order)
  })
  // bindOrdersListeners()
}