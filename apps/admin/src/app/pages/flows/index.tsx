import { useNavigate, useParams } from 'react-router-dom';
import ListFlow from './ListFlows';

const Flows = () => {
	const { applicationId } = useParams();
	const navigate = useNavigate();
	const handleGoToAddFlowPage = () => {
		navigate(`/applications/${applicationId}/add-flow`);
	};
	return (
		<div className="">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold">Chat Flows</h4>
				<div className="flex gap-2">
					{/* <input
						className="px-3 py-2 hover:border-blue-300 rounded-md border-[1px] border-gray-500 w-[250px] focus-visible:border-1 focus-visible:border-blue-300"
						placeholder="Search with Name or Category"
					/> */}
					<button
						onClick={handleGoToAddFlowPage}
						className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md active:bg-blue-500 transition-all"
					>
						Add Flow
					</button>
				</div>
			</div>
			<div className="mt-5 list-flows">
				<ListFlow />
			</div>
		</div>
	);
};
export default Flows;
