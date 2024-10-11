import { IFlow, IFlowDetail } from '../../stores/flow/flow.interface';

interface IFlowMessage {
	input: string;
	output: {
		message: string;
		image: string[];
	};
}
interface IExampleFlow extends IFlow {
	flowDetail: IFlowDetail;
	message: IFlowMessage;
}
const ExampleFlow: IExampleFlow[] = [
	{
		id: 'example-flow-1',
		flowName: 'Command Flow Example',
		description: 'This is an example flow 1',
		status: 'active',
		flowDetail: {
			id: '89c19669-073a-40c7-b55a-0a07c4458510',
			userId: 'a08a1932-10cc-479c-8c1c-7b14cde57fd2',
			flowName: 'Command Flow Example',
			description: 'This is an example about command flow',
			connections: [
				{
					id: '6135d264-7b2c-4667-bdc3-13dc5aa221fa',
					sourceNodeId: 'e3d0ac76-5ca9-4f2f-9f8c-3464f0eaa066',
					sourceHandleId: 'command-input-source-1',
					targetNodeId: '1f076ab8-034a-4f3c-b8e3-963c269e9586',
					targetHandleId: 'command-output-target-1',
					flowId: '89c19669-073a-40c7-b55a-0a07c4458510'
				}
			],
			nodes: [
				{
					id: 'e3d0ac76-5ca9-4f2f-9f8c-3464f0eaa066',
					nodeType: 'commandInput',
					nodeName: 'commandInput',
					measured: '{"width":250,"height":261}',
					position: '{"x":-38,"y":-30}',
					parameters: [
						{
							nodeId: 'e3d0ac76-5ca9-4f2f-9f8c-3464f0eaa066',
							parameterKey: 'commandName',
							parameterValue: '*example command flow',
							id: '01188a03-38a3-42a5-8efa-0966c7a851e5'
						}
					],
					data: {
						id: ''
					},
					selected: false
				},
				{
					id: '1f076ab8-034a-4f3c-b8e3-963c269e9586',
					nodeType: 'uploadedImage',
					nodeName: 'uploadedImage',
					measured: '{"width":250,"height":510}',
					position: '{"x":374,"y":-43}',
					parameters: [
						{
							nodeId: '1f076ab8-034a-4f3c-b8e3-963c269e9586',
							parameterKey: 'message',
							parameterValue: 'hello, this is an example command flow example',
							id: '69206788-5bc9-4fc4-9873-1d2163ea198c'
						},
						{
							nodeId: '1f076ab8-034a-4f3c-b8e3-963c269e9586',
							parameterKey: 'image',
							parameterValue:
								'["https://cdn.mezon.vn/0/0/1831890355411226600/932_undefinedtin_tuc_3.jpg","https://cdn.mezon.vn/0/0/1831890355411226600/634_undefinedtin_tuc_4.jpg","https://cdn.mezon.vn/0/0/1831890355411226600/637_undefinedtin_tuc_8.jpg"]',
							id: 'e277134f-a522-439b-96df-996475717be4'
						}
					],
					data: {
						id: ''
					},
					selected: false
				}
			]
		},
		message: {
			input: '*example command flow',
			output: {
				message: 'hello, this is an example command flow example',
				image: [
					'https://cdn.mezon.vn/0/0/1831890355411226600/932_undefinedtin_tuc_3.jpg',
					'https://cdn.mezon.vn/0/0/1831890355411226600/634_undefinedtin_tuc_4.jpg',
					'https://cdn.mezon.vn/0/0/1831890355411226600/637_undefinedtin_tuc_8.jpg'
				]
			}
		}
	},
	{
		id: 'example-flow-2',
		flowName: 'Api Loader Flow Example',
		description: 'This is an example about api loader flow',
		status: 'active',
		flowDetail: {
			id: '2731557b-2b10-4aef-a07a-a7368e5a2443',
			userId: 'a08a1932-10cc-479c-8c1c-7b14cde57fd2',
			flowName: 'Api Loader Flow Example',
			description: '',
			connections: [
				{
					id: '79fe5473-543a-4c7b-ba01-df80f53eebeb',
					sourceNodeId: '602ce111-4f14-47ea-a053-95fd2381a8d9',
					sourceHandleId: 'api-loader-source-1',
					targetNodeId: 'de3336f0-ff1d-43d0-872f-cd2a58878dea',
					targetHandleId: 'format-function-target-1',
					flowId: '2731557b-2b10-4aef-a07a-a7368e5a2443'
				},
				{
					id: '1ec3490d-b859-4a06-834e-9b435196c74e',
					sourceNodeId: '56c978da-d138-461f-8226-afdd36108d44',
					sourceHandleId: 'command-input-source-1',
					targetNodeId: '602ce111-4f14-47ea-a053-95fd2381a8d9',
					targetHandleId: 'api-loader-target-1',
					flowId: '2731557b-2b10-4aef-a07a-a7368e5a2443'
				}
			],
			nodes: [
				{
					id: '56c978da-d138-461f-8226-afdd36108d44',
					nodeType: 'commandInput',
					nodeName: 'commandInput',
					measured: '{"width":250,"height":261}',
					position: '{"x":56,"y":-79}',
					parameters: [
						{
							nodeId: '56c978da-d138-461f-8226-afdd36108d44',
							parameterKey: 'commandName',
							parameterValue: '*example api loader flow',
							id: '8f391774-12bf-476f-9fbf-01c12407fabd'
						}
					],
					data: {
						id: ''
					},
					selected: false
				},
				{
					id: '602ce111-4f14-47ea-a053-95fd2381a8d9',
					nodeType: 'apiLoader',
					nodeName: 'apiLoader',
					measured: '{"width":250,"height":362}',
					position: '{"x":387,"y":-79}',
					parameters: [
						{
							nodeId: '602ce111-4f14-47ea-a053-95fd2381a8d9',
							parameterKey: 'method',
							parameterValue: 'GET',
							id: 'edc67de4-c31a-41f1-9a09-dc904d71cc2b'
						},
						{
							nodeId: '602ce111-4f14-47ea-a053-95fd2381a8d9',
							parameterKey: 'url',
							parameterValue: 'https://66b049b36a693a95b53843dc.mockapi.io/list-todo',
							id: 'abde8ca0-435a-4deb-921b-b383f4a0bdc2'
						}
					],
					data: {
						id: ''
					},
					selected: false
				},
				{
					id: 'de3336f0-ff1d-43d0-872f-cd2a58878dea',
					nodeType: 'formatFunction',
					nodeName: 'formatFunction',
					measured: '{"width":250,"height":666}',
					position: '{"x":686,"y":-82}',
					parameters: [
						{
							nodeId: 'de3336f0-ff1d-43d0-872f-cd2a58878dea',
							parameterKey: 'functionName',
							parameterValue: 'getTodo',
							id: '0e3168c9-3020-425a-83be-996c0ec1eb9e'
						},
						{
							nodeId: 'de3336f0-ff1d-43d0-872f-cd2a58878dea',
							parameterKey: 'variable',
							parameterValue: 'data',
							id: '620faf9f-57ae-4895-bbfb-2ed4c88b5b7f'
						},
						{
							nodeId: 'de3336f0-ff1d-43d0-872f-cd2a58878dea',
							parameterKey: 'functionBody',
							parameterValue:
								'let table = `| ${"ID".padEnd(5)} | ${"Title".padEnd(20)} | ${"Is Completed".padEnd(10)} |\\n`;\ntable += `|${"-".repeat(5 + 2)}|${"-".repeat(20 + 2)}|${"-".repeat(10 + 2)}|\\n`;\n\ndata.forEach(item => {\n\t\ttable += `| ${item.id.toString().padEnd(5)} | ${item.title.padEnd(20)} | ${(item.isCompleted ? "Yes" : "No").padEnd(10)} |\\n`;\n});\n\nreturn table;',
							id: '7a988d2f-c98e-466a-a6af-7a64d7954cf4'
						}
					],
					data: {
						id: ''
					},
					selected: false
				}
			]
		},
		message: {
			input: '*example api loader flow',
			output: {
				message:
					'| ID    | Title                | Is Completed |\n|-------|----------------------|------------|\n| 6     | title 6              | Yes        |\n| 7     | title 7              | Yes        |\n| 8     | title 8              | Yes        |\n| 9     | title 9              | Yes        |\n| 11    | title 11             | Yes        |\n| 12    | title 12             | Yes        |\n| 13    | title 13             | No         |\n| 14    | title 14             | No         |\n| 15    | title 15             | No         |\n| 16    | title 16             | No         |\n|',
				image: []
			}
		}
	}
];
export default ExampleFlow;
