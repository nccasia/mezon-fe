import { selectAllPermissionsDefault } from "@mezon/store";
import { Icons } from "@mezon/ui";
import { useState } from "react";
import { useSelector } from "react-redux";

const ListPermission = () => {
    const listPermission = useSelector(selectAllPermissionsDefault);
    return(
        <div className="basis-2/3">
            <h4 className="uppercase font-bold text-xs text-contentTertiary mb-2">General Channel Permissions</h4>
            <div className="space-y-2">
                {listPermission.map(item => 
                    <ItemPermission 
                        key={item.id}
                        id={item.id}
                        title={item.title}
                    />
                )}
            </div>
        </div>
    )
}

export default ListPermission;

type ItemPermissionProps = {
    id?: string;
    title?: string;
}

enum TypeChoose  {
    Remove= 1,
    Or=2,
    Tick=3,
}

const ItemPermission = (props: ItemPermissionProps) => {
    const {id, title} = props;
    const [choose, setChoose] = useState(TypeChoose.Or);
    const handleSelect = (option: number) => {
        setChoose(option);
    };

    const className = {
        wrapperClass: 'h-[26px] flex rounded-md overflow-hidden border dark:border-gray-700 border-gray-300',
        buttonClass: 'w-8 flex justify-center items-center border dark:border-gray-700 border-gray-300',
    }
    return(
        <div className="flex justify-between items-center">
            <p className="font-semibold text-base">{title}</p>
            <div className={className.wrapperClass}>
                <button 
                    className={`${className.buttonClass} ${choose === TypeChoose.Remove ? 'bg-colorDanger' : ''}`}
                    onClick={() => handleSelect(TypeChoose.Remove)}
                >
                    <Icons.Close defaultSize='size-4'/>
                </button>
                <button 
                    onClick={() => handleSelect(TypeChoose.Or)}
                    className={`${className.buttonClass} ${choose === TypeChoose.Or ? 'bg-bgModifierHover' : ''}`}
                >
                    <Icons.IconOr defaultSize='size-4'/>
                </button>
                <button 
                    onClick={() => handleSelect(TypeChoose.Tick)}
                    className={`${className.buttonClass} ${choose === TypeChoose.Tick ? 'bg-colorSuccess' : ''}`}
                >
                    <Icons.IconTick defaultSize='size-4'/>
                </button>
            </div>
        </div>
    )
}