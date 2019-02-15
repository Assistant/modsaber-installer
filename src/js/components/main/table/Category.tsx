import React, { FunctionComponent, useState } from 'react'
import { IMod } from '../../../models/modsaber'
import { setSelectedMod } from '../../../store/mods'
import Mod from './Mod'

interface IProps {
  name: string
  mods: IMod[]
  first: boolean

  setSelectedMod: typeof setSelectedMod
}

const Category: FunctionComponent<IProps> = props => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <tr>
        <td colSpan={5}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              marginTop: props.first ? '30px' : undefined,
            }}
          >
            <b style={{ marginRight: '12px' }}>
              <i
                className={`fas fa-angle-down collapse${
                  collapsed ? ' collapsed' : ''
                }`}
                onClick={() => setCollapsed(!collapsed)}
              />
              &nbsp;{' '}
              <span onDoubleClick={() => setCollapsed(!collapsed)}>
                {props.name}
              </span>
            </b>

            <div className='separator' />
          </div>
        </td>
      </tr>

      {collapsed ? null : props.mods.map((mod, i) => <Mod key={i} mod={mod} />)}
    </>
  )
}

export default Category
