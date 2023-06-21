import {getData} from './getData';
import {state} from "./state";

export const topFiltersHandler = () => {
    const plotFilters = document.querySelector('.nav-filters__plots')
    const filterFilters = document.querySelector('.nav-filters__filters')
    const selectUser = document.querySelector('.select-user')
    const extensions = ['все', 'тестовый участок', 'тестовый фильтр']
    const checkExt = (extensions, ext) => {
        let flag = false
        extensions.forEach(d => {
            if (d === ext) {
                flag = true
            }
        })
        return flag
    }

    const drawData = (data, block) => {
        data.forEach(d => {
            let condition = !checkExt(extensions, d.name)
            if (condition) {
                block.insertAdjacentHTML('beforeend', `
                <li class='nav-filters__item'>
                    <button class='nav-filters__button main__button'>${d.name.toUpperCase()}</button>
                 </li>
        `)
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
                const plot = target.textContent.toLowerCase()

                if (!target.classList.contains('chosen__plot')) {
                    state['currentTopPlots'].push(plot)
                } else {
                    state['currentTopPlots'] = state['currentTopPlots'].filter(cP => cP !== plot)
                }

                target.classList.toggle('chosen__plot')
                target.classList.toggle('nav-filters__button--chosen')
                filterByPlots()
            })
        })
    }

    const filterByPlots = () => {
        state['currentTopFilters'] = state['topFilters'].filter(filt =>
            state['currentTopPlots'].includes(filt.plot)
        )

        removeData(filterFilters)
        if (state['currentTopFilters'].length) {
            drawData(state['currentTopFilters'], filterFilters)
        } else {
            drawData(state['topFilters'], filterFilters)
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
        drawData(newPlots, plotFilters)
    }


    const filterListener = block => {
        block.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', e => {
                const target = e.target
                const filter = target.textContent.toLowerCase()

                if (!target.classList.contains('chosen__filter')) {
                    state['currentTopFilters'].push(filter)
                } else {
                    state['currentTopFilters'] = state['currentTopFilters'].filter(cP => cP !== filter)
                }

                target.classList.toggle('chosen__filter')
                target.classList.toggle('nav-filters__button--chosen')
            })
        })
    }


    const drawUsers = users => {
        users.forEach(u => {
            document.querySelector('.select-user').insertAdjacentHTML('beforeend', `
            <option value='${u.id}'>
                ${u.name}
            </option>
        `)
        })
    }

    const draw = async () => {
        let plots = []
        let filters = []

        await getData('filters/get-all')
            .then(data => {
                drawData(data.data, filterFilters)
                filters = data.data
                state['topFilters'] = filters
            }).then(_ => filterListener(filterFilters))

        await getData('plots/get-all')
            .then(data => {
                drawData(data.data, plotFilters)
                plots = data.data
                state['topPlots'] = plots
            }).then(_ => plotListener(plotFilters))

        if (selectUser !== null) {
            await getData('users/get-operators')
                .then(data => {
                    drawUsers(data.data)
                    state['currentTopPlots'] = data.data[0].plot
                    removePlotsByUser(data.data[0].plot, state['topPlots'])
                    filterByPlots()
                    plotListener(plotFilters)
                })
        }
    }
    draw()
}