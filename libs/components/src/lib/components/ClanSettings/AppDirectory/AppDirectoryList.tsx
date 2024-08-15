import AppDirectoryItem from "./AppDirectoryItem";
import { ListGaming } from "./listAppDirectory";

export interface IAppDirectoryList {
  cate: string;
  listAppDirectory: IAppDirectoryItem[];
}

export interface IAppDirectoryItem {
  botName: string;
  botCate?: string;
  botDescription: string;
  botNumber: number
}

const listAppDirectory: IAppDirectoryList[] = [
  {
    cate: "Gaming Companion Apps",
    listAppDirectory: ListGaming
  },
  {
    cate: "Popular & Trending Apps",
    listAppDirectory: ListGaming
  },
  {
    cate: "Server Mini-Games",
    listAppDirectory: ListGaming
  }, {
    cate: "Role-Playing Favorites",
    listAppDirectory: ListGaming
  },
]
const AppDirectoryList = () => {
  return (
    <>
      {
        listAppDirectory.map(listAppDirectByCate => (
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-xl">{listAppDirectByCate.cate}</p>
            <div className="flex justify-between items-center gap-4">
              {
                listAppDirectByCate.listAppDirectory.map(appDirectoryItem => (
                  <AppDirectoryItem appDriectory={appDirectoryItem} />
                ))
              }
            </div>
          </div>
        ))
      }
    </>
  )
}

export default AppDirectoryList
