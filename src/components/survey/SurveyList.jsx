import React, { Component } from 'react';
import _ from 'lodash';
import {
  Row, Col, Tree, Empty,
  Button, Popover, Tooltip, Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import RemoteSelect from '../basic/RemoteSelect';
import Modal from '../basic/Modal';
import getAgentInstance from '../../helpers/superagent';
import EditQuestions from './questions/EditQuestions';
import NewQuestions from './questions/NewQuestions';
import NewAnswer from './answers/NewAnswer';
import EditAnswer from './answers/EditAnswer';
import CopyQuestions from './questions/CopyQuestions';
import CopyAnswer from './answers/CopyAnswer';
import Loading from '../basic/Loading';

const superagent = getAgentInstance();

export default class SurveyList extends Component {
  constructor() {
    super();
    this.initialState = () => ({
      nodes: [],
      loading: false,
      editQuestion: false,
      addQuestion: false,
      questionData: undefined,
      specialityId: undefined,
      editAnswer: false,
      addAnswer: false,
      EditAnswer: false,
      disableAddAnswer: true,
      isEmpty: true,
      loadedKeys: [],
      parentId: undefined,
      currentCopyQuestion: {},
      currentCopyAnswer: {},
    });
    this.state = this.initialState();

    this.loadQuestions = (id) => {
      this.setState({ loading: true });
      const params = {
        limit: 100,
        offset: 0,
        speciality_id: id,
      };
      superagent
        .get('/admin/specialitysurvey/question/list')
        .query(params)
        .end((err, res) => {
          if (!err) {
            const { body } = res;
            const nodes = body.map((n) => ({
              data: n,
              title: (
                <Popover
                  content={(
                    <Button.Group>
                      <Popconfirm
                        title="Are you sure to delete node?"
                        onConfirm={() => this.deleteNode(n)}
                      >
                        <Button
                          type="dashed"
                          size="small"
                          style={{ color: '#cf1322' }}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                      <Button
                        type="dashed"
                        size="small"
                        onClick={() => this.copyQuestion(n)}
                      >
                        Copy To
                      </Button>
                    </Button.Group>
                  )}
                  placement="right"
                >
                  <span style={{ color: !n.active ? '#cf1322' : undefined }}>
                    {n.title_en}
                  </span>
                </Popover>
              ),
              key: n.id,
              isLeaf: false,
            }));
            this.setState({ nodes, loadedKeys: [], loading: false });
          }
        });
    };
    this.copyQuestion = (n) => {
      this.setState({ currentCopyQuestion: n }, () => this.copyQuestionBtnRef?.current.click());
    };
    this.copyAnswer = (n) => {
      this.setState({ currentCopyAnswer: n }, () => this.currentCopyAnswerBtnRef?.current.click());
    };
    this.onLoadData = (node) => {
      const { nodes, loadedKeys } = this.state;
      return new Promise((resolve) => {
        const params = {
          limit: 100,
          offset: 0,
          question_id: node.key,
        };
        superagent
          .get('/admin/specialitysurvey/answer/list')
          .query(params)
          .end((err, res) => {
            if (!err) {
              const { body } = res;
              const nodeChilds = body.map((n) => ({
                data: n,
                title: (
                  <Popover
                    content={(
                      <Button.Group>
                        <Popconfirm
                          title="Are you sure to delete node?"
                          onConfirm={() => this.deleteNode(n)}
                        >
                          <Button
                            type="dashed"
                            size="small"
                            style={{ color: '#cf1322' }}
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                        <Button
                          type="dashed"
                          size="small"
                          onClick={() => this.copyAnswer(n)}
                        >
                          Copy To
                        </Button>
                      </Button.Group>
                    )}
                    placement="right"
                  >
                    <span>
                      {n.title_en}
                      {' '}
                      { n.active ? '✓' : '✕'}
                    </span>
                  </Popover>
                ),
                key: n.id,
                isLeaf: true,
              }));
              const newNodes = nodes;
              const nodeIndex = _.findIndex(newNodes, (n) => n.key === node.key);
              if (nodeIndex > -1) {
                newNodes[nodeIndex].children = nodeChilds;
                this.setState({ nodes: newNodes, loadedKeys: [...loadedKeys, node.key] }, () => {
                  setTimeout(() => {
                    resolve();
                  }, 200);
                });
              }
            }
          });
      });
    };

    this.expandedNode = (key, node) => {
      const lastKey = key.slice(-1)[0];
      if (!node.expanded) {
        this.setState({ loadedKeys: [lastKey] });
      }
    };

    this.deleteNode = (node) => {
      const { nodes } = this.state;
      let newNodes = nodes;
      if (node.type === 'question') {
        newNodes = nodes.filter((n) => n.key !== node.id);
      } else {
        newNodes = nodes.map((n) => {
          const childs = n.children;
          const newNode = n;
          if (childs) {
            newNode.children = childs.filter((cn) => cn.key !== node.id);
          }
          return newNode;
        });
      }
      superagent
        .patch(`/admin/specialitysurvey/${node.id}`)
        .send({ deleted: 1 })
        .end((err) => {
          if (!err) {
            this.setState({
              nodes: newNodes,
              disableAddAnswer: true,
              editQuestion: false,
              addQuestion: false,
              editAnswer: false,
              addAnswer: false,
              isEmpty: true,
            });
          }
        });
    };

    this.selectedSpeciality = (record) => {
      this.setState({
        specialityId: record.key,
        disableAddAnswer: true,
        editQuestion: false,
        addQuestion: false,
        editAnswer: false,
        addAnswer: false,
        isEmpty: true,
      });
      this.loadQuestions(record.key);
    };
    this.selectedNode = (key, record) => {
      const { data } = record.node;
      this.setState({ questionData: data });
      if (data.type === 'question') {
        this.showEditQuestion();
        this.setState({ disableAddAnswer: false, parentId: data.id });
      }
      if (data.type === 'answer') {
        this.showEditAnswer();
        this.setState({ disableAddAnswer: true, parentId: data.parent_id });
      }
    };

    this.showEditQuestion = () => {
      this.setState({
        editQuestion: true,
        addQuestion: false,
        editAnswer: false,
        addAnswer: false,
        isEmpty: false,
      });
    };

    this.showEditAnswer = () => {
      this.setState({
        editQuestion: false,
        addQuestion: false,
        addAnswer: false,
        editAnswer: true,
        isEmpty: false,
      });
    };

    this.addNewQuestion = () => {
      this.setState({
        addQuestion: true,
        isEmpty: false,
        editAnswer: false,
        editQuestion: false,
        addAnswer: false,
      });
    };

    this.addNewAnswer = () => {
      this.setState({
        addAnswer: true,
        isEmpty: false,
        editQuestion: false,
        editAnswer: false,
        addQuestion: false,
      });
    };

    this.EditQuestionSuccess = (key, nodeData) => {
      const { nodes } = this.state;
      let nodeIndex = -1;
      const currentNode = _.find(nodes, (o, index) => {
        const passes = o.key === key;
        if (passes) {
          nodeIndex = index;
        }
        return passes;
      });
      currentNode.data = { ...currentNode.data, ...nodeData };
      currentNode.title = (
        <Popover
          content={(
            <Button
              type="text"
              size="small"
              style={{ color: '#cf1322' }}
              onClick={() => this.deleteNode(nodeData)}
            >
              Delete
            </Button>
          )}
          placement="right"
        >
          <span style={{ color: !nodeData.active ? '#cf1322' : undefined }}>
            {nodeData.title_en}
          </span>
        </Popover>
      );
      const newNodes = nodes;
      newNodes[nodeIndex] = currentNode;
      this.setState({ nodes: newNodes });
    };
    this.EditAnswerSuccess = (key, nodeData) => {
      const { nodes } = this.state;
      let parentNodeIndex = -1;
      let childNodeIndex = -1;

      const parentNode = _.find(nodes, (o, index) => {
        const passes = o.key === nodeData.parent_id;
        if (passes) {
          parentNodeIndex = index;
        }
        return passes;
      });
      const [currentNode] = parentNode.children.filter((o, index) => {
        const passes = o.key === key;
        if (passes) {
          childNodeIndex = index;
        }
        return passes;
      });
      if (currentNode) {
        currentNode.data = { ...currentNode.data, ...nodeData };
        currentNode.title = (
          <Popover
            content={(
              <Button
                type="text"
                size="small"
                style={{ color: '#cf1322' }}
                onClick={() => this.deleteNode(nodeData)}
              >
                Delete
              </Button>
          )}
            placement="right"
          >
            <span>
              {nodeData.title_en}
              {' '}
              { nodeData.active ? '✓' : '✕'}
            </span>
          </Popover>
        );
        const newNodes = nodes;
        newNodes[parentNodeIndex].children[childNodeIndex] = currentNode;
        this.setState({ nodes: newNodes });
      }
    };

    this.copyQuestionBtnRef = React.createRef();
    this.currentCopyAnswerBtnRef = React.createRef();
  }

  render() {
    const {
      nodes, editQuestion, questionData, specialityId,
      addQuestion, isEmpty, addAnswer, loadedKeys, editAnswer,
      disableAddAnswer, parentId, loading,
      currentCopyQuestion, currentCopyAnswer,
    } = this.state;
    return (
      <>
        <Modal
          btnRef={this.copyQuestionBtnRef}
          size="modal-md"
          header="Copy Question"
        >
          <CopyQuestions resourceId={currentCopyQuestion.id} />
        </Modal>
        <Modal
          btnRef={this.currentCopyAnswerBtnRef}
          size="modal-md"
          header="Copy Answer"
        >
          <CopyAnswer resourceId={currentCopyAnswer.id} />
        </Modal>
        <Row gutter={10}>
          <Col xl={4} sm={12} xs={24} style={{ height: 32, marginBottom: 15 }}>
            <Button
              block
              type="dashed"
              icon={<PlusOutlined />}
              disabled={!specialityId}
              onClick={this.addNewQuestion}
            >
              Add Question
            </Button>
          </Col>
          <Col xl={4} sm={12} xs={24} style={{ height: 32, marginBottom: 15 }}>
            <Button
              block
              type="dashed"
              icon={<PlusOutlined />}
              disabled={disableAddAnswer}
              onClick={this.addNewAnswer}
            >
              Add Answer
            </Button>
          </Col>
          <Col xl={16} xs={24} style={{ marginBottom: 15 }}>
            <RemoteSelect
              placeholder="Selcet Speciality"
              endpoint="/admin/speciality/list"
              onChange={this.selectedSpeciality}
              optiontext={(op) => (
                <>
                  <Row>
                    <Col span={16}>
                      <div>{op.name_en}</div>
                    </Col>
                    <Col span={8} style={{ textAlign: 'end' }}>
                      <Tooltip
                        color="#34d698"
                        placement="top"
                        title={(
                          <>
                            <div>
                              Active:
                              {' '}
                              {op.active ? 'True' : 'False'}
                            </div>
                          </>
                        )}
                      >
                        { op.active ? <CheckOutlined style={{ color: '#34d698' }} /> : <CloseOutlined />}
                      </Tooltip>
                    </Col>
                  </Row>
                </>
              )}
            />
          </Col>
        </Row>
        <Row style={{ minHeight: '40vh', borderTop: '1px solid #d9d9d9' }}>
          <Col md={8} sm={12} xs={24} style={{ padding: 10 }}>
            <div style={{
              top: '30%',
              left: '46%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
            }}
            >
              <Loading visible={loading} />
            </div>
            { nodes.length && !loading ? (
              <>
                <Tree
                  showIcon
                  treeData={nodes}
                  loadedKeys={loadedKeys}
                  expandedKeys={loadedKeys}
                  loadData={this.onLoadData}
                  onExpand={this.expandedNode}
                  onSelect={this.selectedNode}
                />
              </>
            ) : null}
            { !nodes.length && !loading ? <Empty /> : null }
          </Col>
          <Col md={16} sm={12} xs={24} style={{ borderLeft: '1px solid #d9d9d9', padding: 10 }}>
            { editQuestion ? (
              <EditQuestions
                key={questionData.id}
                resourceId={questionData.id}
                specialityId={specialityId}
                reloadTree={this.loadQuestions}
                onSuccess={this.EditQuestionSuccess}
              />
            ) : null}

            { addQuestion ? (
              <NewQuestions
                specialityId={specialityId}
                reloadTree={this.loadQuestions}
              />
            ) : null}

            { editAnswer ? (
              <EditAnswer
                parentId={parentId}
                key={questionData.id}
                specialityId={specialityId}
                resourceId={questionData.id}
                onSuccess={this.EditAnswerSuccess}
              />
            ) : null}

            { addAnswer ? (
              <NewAnswer
                specialityId={specialityId}
                parentId={parentId}
                reloadTree={this.loadQuestions}
              />
            ) : null}

            { isEmpty ? <Empty /> : null }
          </Col>
        </Row>
      </>
    );
  }
}
