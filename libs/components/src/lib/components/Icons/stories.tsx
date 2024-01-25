import { Story, Meta } from '@storybook/react'
import * as Icons from '.'

export default {
  title: 'Icons',
  args: {
    className: 'w-12',
    color: 'black'
  }
} as Meta

export const AllIcons: Story = (args) => {
  const icons = Object.keys(Icons)

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {icons.map((iconIndex, i) => (
        <div
          key={i}
          className="flex flex-col justify-center items-center p-4 bg-slate-200"
        >
          {Icons[iconIndex as keyof typeof Icons]({
            ...args
          })}
          <span className="mt-4 font-semibold text-slate-900">{`<${iconIndex}/>`}</span>
        </div>
      ))}
    </div>
  )
}
