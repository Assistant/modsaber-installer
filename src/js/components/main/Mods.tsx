import React, { FunctionComponent, useMemo } from 'react'
import { connect } from 'react-redux'

import { ICategory, IMod } from '../../models/modsaber'
import { IState } from '../../store'
import { setSelectedMod, toggleMod } from '../../store/mods'

import Styler from '../utils/Styler'
import Category from './table/Category'

import { CATEGORY_DEFAULT, STYLE_OVERRIDE } from '../../constants'

import '../../../css/scrollbar.css'
import '../../../css/table.css'

interface IProps {
  mods: IMod[]
  selected: number | null

  setSelectedMod: typeof setSelectedMod
  toggleMod: typeof toggleMod
}

const categorize = (mods: IMod[]) => {
  const categories: ICategory[] = []
  for (const mod of mods) {
    const other = CATEGORY_DEFAULT
    const category = mod.meta.category

    if (!categories.find(x => x.name === category)) {
      categories.push({ name: category, weight: 0, mods: [] })
    }
    const current = categories.find(x => x.name === category) as ICategory

    current.mods.push(mod)
    if (category !== other) current.weight += mod.meta.weight
    else current.weight -= 10
  }

  categories.sort((a, b) => {
    const weight = b.weight / b.mods.length - a.weight / a.mods.length

    if (weight !== 0) return weight
    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  })

  return [...categories]
}

const Mods: FunctionComponent<IProps> = props => {
  const categories = useMemo(() => categorize(props.mods), [props.mods])

  return (
    <>
      <Styler content={STYLE_OVERRIDE} />

      <table className='table is-narrow is-fullwidth'>
        <thead>
          <div
            onClick={() => {
              props.setSelectedMod(null)
            }}
            className='header'
          />
          <tr>
            <th>
              -<div />
            </th>
            <th>
              Name<div>Name</div>
            </th>
            <th>
              Author<div>Author</div>
            </th>
            <th>
              Version<div>Version</div>
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category, i) => (
            <Category
              key={i}
              name={category.name}
              mods={category.mods}
              first={i === 0}
              setSelectedMod={setSelectedMod}
            />
          ))}
        </tbody>
      </table>
    </>
  )
}

const mapStateToProps: (state: IState) => IProps = state => ({
  mods: state.mods.list,
  selected: state.mods.selected,

  setSelectedMod,
  toggleMod,
})

export default connect(
  mapStateToProps,
  { setSelectedMod, toggleMod }
)(Mods)
