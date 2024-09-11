import { Link, useParams } from 'react-router-dom';

const ListFlow = () => {
	const { applicationId } = useParams();
	const listFlow = [
		{
			id: 1,
			name: 'Example flow 1',
			description: 'This is a description of example flow 1'
		},
		{
			id: 2,
			name: 'Example flow 2',
			description: 'This is a description of example flow 2'
		},
		{
			id: 3,
			name: 'Example flow 3',
			description: 'This is a description of example flow 3'
		},
		{
			id: 4,
			name: 'Example flow 4',
			description: 'This is a description of example flow 4'
		}
	];
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
			{listFlow.map((flow) => (
				<Link
					to={`/applications/${applicationId}/flow/${flow.id}`}
					key={flow.id}
					className="bg-white min-h-[150px] dark:bg-gray-800 p-3 rounded-md shadow-md border-[1px] border-slate-300 cursor-pointer hover:shadow-inner transition-all"
				>
					<h4 className="font-semibold">{flow.name}</h4>
					<p className="text-gray-500 mt-2">{flow.description}</p>
				</Link>
			))}
		</div>
	);
};
export default ListFlow;
