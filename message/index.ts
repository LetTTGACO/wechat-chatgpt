import { Message, Sayable } from 'wechaty'
import config from '../config'
import { reply } from '../lib/reply'
import * as echo from './echo'
import * as fund from './fund'

type Route = {
  handle: ((text: string, msg: Message) => Sayable) | ((text: string, msg: Message) => Promise<Sayable>)
  keyword: string | RegExp
  filter?: (msg: Message) => boolean | Promise<boolean>
}

export const routes: Route[] = [
  {
    keyword: '/ping',
    handle() {
      return 'pong'
    },
  },
  { keyword: '基金', handle: fund.handle },
  {
    keyword: '',
    async handle(text, msg) {
      const talker = msg.talker()
      const answer = await reply([
        {
          role: 'user',
          content: `${config.prompt} ${text}`,
        },
      ])
      return msg.room() ? `@${talker.name()} ${answer}` : answer
    },
    async filter (msg) {
      const room = msg.room()
      if (room && config.enableGroup) {
        if (config.enableGroup === true) {
          return true
        }
        const topic = await room.topic()
        return config.enableGroup.test(topic)
      }
      if (!room && config.enablePrivate) {
        if (config.enablePrivate === true) {
          return true
        }
        return config.enablePrivate.test(msg.talker().name())
      }
      return false
    }
  },
]
