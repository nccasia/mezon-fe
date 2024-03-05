import { useClans, useRoles } from "@mezon/core";
import { getNewAddMembers, getSelectedRoleId, setAddMemberRoles } from "@mezon/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AddMembersModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const { RolesClan, updateRole } = useRoles();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const { usersClan, currentClan } = useClans();
    const addUsers = useSelector(getNewAddMembers);
    
    const clickRole = useSelector(getSelectedRoleId);
    const activeRole = RolesClan.find(role => role.id === clickRole);
    const memberRoles = activeRole?.role_user_list?.role_users;
    const membersNotInRoles = usersClan.filter(member => {
        return !memberRoles || !memberRoles.some(roleMember => roleMember.id === member.id);
    });
    
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            const filteredMemberIds = membersNotInRoles
                .filter(member => addUsers.includes(member.id))
                .map(member => member.id);
            setSelectedUsers(filteredMemberIds);
        }
    }, [isOpen]);
    
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    useEffect(() => {
        setSearchResults(membersNotInRoles)
    },[clickRole])
    
    const handleUserToggle = (permissionId: string) => {
        setSelectedUsers(prevPermissions => {
            if (prevPermissions.includes(permissionId)) {
                return prevPermissions.filter(id => id !== permissionId);
            } else {
                return [...prevPermissions, permissionId];
            }
        });
    };
    
    useEffect(() => {
        const results = membersNotInRoles.filter(member =>
            member.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
    }, [searchTerm]);
    
    const handleUpdateRole = async () =>{
        if (clickRole === 'New Role') {
            dispatch(setAddMemberRoles(selectedUsers));
        }else{
            await updateRole(currentClan?.id ?? '',clickRole,'',selectedUsers,[],[],[]);
        }
    }
    
	return (
		<>
			{isOpen && (
                    <div className="fixed  inset-0 flex items-center justify-center z-50">
                        <div className="fixed inset-0 bg-black opacity-50"></div>
                        <div className="relative z-10 dark:bg-gray-900  bg-bgDisable p-6 rounded-[5px] text-center h-[400px]">
                            <h2 className="text-[30px] font-semibold mb-2">Add members</h2>
                            <p className="text-white-600 mb-6 text-[16px]">{activeRole?.title}</p>
                            <div>
                                <div className="w-full pr-[10px] flex">
                                    <input 
                                        className="flex-grow bg-black p-[7px] border-2 rounded-lg mr-[10px]"
                                        type="text" 
                                        placeholder="Search Permissions"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <br />
                                <div className="overflow-auto">
                                    <ul>
                                        {searchResults.map(permission => (
                                            <li key={permission.id} className="flex items-center justify-between pb-[5px]">
                                                <span className="mr-auto">{permission?.user?.display_name}</span>
                                                <label className="ml-auto">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(permission.id)}
                                                        onChange={() => handleUserToggle(permission.id)}
                                                    />
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex justify-center mt-10 text-[14px]">
                                <button
                                    color="gray"
                                    onClick={onClose}
                                    className="px-4 py-2 mr-5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    color="blue"
                                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
                                    onClick = {()=>{
                                        handleUpdateRole();
                                        onClose();
                                    }
                                    }
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
			)}
		</>
	);
};