import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import flowService from '../../../services/flowService';
import { IFlow } from '../../../stores/flow/flow.interface';
import ExampleFlow from '../ExampleFlows';

const ListFlow = () => {
	const { applicationId } = useParams();
	const [listFlow, setListFlow] = useState<IFlow[]>([]);
	useEffect(() => {
		const getListFlow = async () => {
			try {
				const res: IFlow[] = await flowService.getAllFlowByApplication(applicationId ?? '');
				setListFlow(res);
			} catch (error) {
				console.log(error);
			}
		};
		getListFlow();
	}, [applicationId]);
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
			{listFlow.map((flow) => (
				<Link
					to={`/applications/${applicationId}/flow/${flow.id}`}
					key={flow.id}
					className="bg-white min-h-[150px] dark:bg-gray-800 dark:hover:bg-gray-700 p-3 rounded-md shadow-md border-[1px] border-slate-300 cursor-pointer hover:shadow-inner transition-all"
				>
					<h4 className="font-semibold">{flow.flowName}</h4>
					<p className="text-gray-500 mt-2">{flow.description}</p>
				</Link>
			))}
			{ExampleFlow.map((flow) => (
				<Link
					to={`/applications/${applicationId}/flow/${flow.id}`}
					key={flow.id}
					className="bg-white min-h-[150px] dark:bg-gray-800 dark:hover:bg-gray-700 p-3 rounded-md shadow-md border-[1px] border-slate-300 cursor-pointer hover:shadow-inner transition-all"
				>
					<h4 className="font-semibold">{flow.flowName}</h4>
					<p className="text-gray-500 mt-2">{flow.description}</p>
				</Link>
			))}
		</div>
	);
};
export default ListFlow;
