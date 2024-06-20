import { RolesClanEntity} from "@mezon/store";

type ListActiveRoleProps = {
    activeRoles: RolesClanEntity[];
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
    handleRoleClick: (roleId: string) => void;
}

const ListActiveRole = (props: ListActiveRoleProps) => {
    const {activeRoles, handleRoleClick, setShowModal, setOpenEdit} = props;

    return (
        activeRoles.map((role) => (
            <tr key={role.id} className="h-14 dark:text-white text-black">
                <td className="text-center ">
                    <p
                        className="text-[15px] break-all whitespace-break-spaces overflow-hidden line-clamp-2"
                        onClick={() => {
                            setShowModal(false);
                        }}
                    >
                        {role.title}
                    </p>
                </td>
                <td className=" text-[15px] text-center">
                    <p>{role.role_user_list?.role_users?.length ?? 0}</p>
                </td>
                <td className="  flex h-14 justify-center items-center">
                    <div className="flex gap-x-1 ">
                        <p
                            className="text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight p-2 rounded-sm"
                            onClick={() => {
                                handleRoleClick(role.id);
                                setOpenEdit(true);
                            }}
                        >
                            Edit
                        </p>
                        <p
                            className="text-[15px] cursor-pointer dark:hover:bg-slate-800 hover:bg-bgModifierHoverLight p-2 rounded-sm"
                            onClick={() => {
                                setShowModal(true);
                                handleRoleClick(role.id);
                            }}
                        >
                            Delete
                        </p>
                    </div>
                </td>
            </tr>
        )
    ));
}

export default ListActiveRole;